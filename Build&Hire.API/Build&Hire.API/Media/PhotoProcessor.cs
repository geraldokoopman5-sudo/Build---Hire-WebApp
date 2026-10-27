using FluentValidation;
using SkiaSharp;

namespace Build_Hire.API.Media;

public static class PhotoProcessor
{
    public const int MaxUploadBytes = 5 * 1024 * 1024;
    public const int MaxRequestBytes = MaxUploadBytes + 64 * 1024;

    public static async Task<byte[]> ProcessAsync(IFormFile? file, int maxSize, CancellationToken cancellationToken)
    {
        if (file is null || file.Length == 0) throw new ValidationException("Choose a photo to upload.");
        if (file.Length > MaxUploadBytes) throw new ValidationException("Photos must be 5 MB or smaller.");
        await using var input = new MemoryStream();
        await file.CopyToAsync(input, cancellationToken);
        input.Position = 0;
        using var codec = SKCodec.Create(input);
        if (codec is null || codec.EncodedFormat is not (SKEncodedImageFormat.Jpeg or SKEncodedImageFormat.Png or SKEncodedImageFormat.Webp))
            throw new ValidationException("Choose a valid JPEG, PNG, or WebP photo.");
        var info = codec.Info;
        if (info.Width < 1 || info.Height < 1 || (long)info.Width * info.Height > 20_000_000)
            throw new ValidationException("Choose a photo with no more than 20 megapixels.");
        if (codec.FrameCount > 1) throw new ValidationException("Choose a still photo rather than an animation.");
        using var decoded = new SKBitmap(new SKImageInfo(info.Width, info.Height, SKColorType.Rgba8888, SKAlphaType.Premul));
        if (codec.GetPixels(decoded.Info, decoded.GetPixels()) != SKCodecResult.Success)
            throw new ValidationException("This photo could not be read. Choose a valid image.");
        cancellationToken.ThrowIfCancellationRequested();
        var rotated = codec.EncodedOrigin is SKEncodedOrigin.LeftTop or SKEncodedOrigin.RightTop
            or SKEncodedOrigin.RightBottom or SKEncodedOrigin.LeftBottom;
        var width = rotated ? info.Height : info.Width;
        var height = rotated ? info.Width : info.Height;
        var scale = Math.Min(1d, (double)maxSize / Math.Max(width, height));
        using var resized = new SKBitmap(new SKImageInfo(Math.Max(1, (int)Math.Round(width * scale)),
            Math.Max(1, (int)Math.Round(height * scale)), SKColorType.Rgba8888, SKAlphaType.Opaque));
        using (var canvas = new SKCanvas(resized))
        {
            canvas.Clear(SKColors.White);
            canvas.Scale((float)resized.Width / width, (float)resized.Height / height);
            // Apply camera orientation before encoding; no source metadata is copied.
            var orientation = codec.EncodedOrigin switch
            {
                SKEncodedOrigin.TopRight => new SKMatrix(-1, 0, info.Width, 0, 1, 0, 0, 0, 1),
                SKEncodedOrigin.BottomRight => new SKMatrix(-1, 0, info.Width, 0, -1, info.Height, 0, 0, 1),
                SKEncodedOrigin.BottomLeft => new SKMatrix(1, 0, 0, 0, -1, info.Height, 0, 0, 1),
                SKEncodedOrigin.LeftTop => new SKMatrix(0, 1, 0, 1, 0, 0, 0, 0, 1),
                SKEncodedOrigin.RightTop => new SKMatrix(0, -1, info.Height, 1, 0, 0, 0, 0, 1),
                SKEncodedOrigin.RightBottom => new SKMatrix(0, -1, info.Height, -1, 0, info.Width, 0, 0, 1),
                SKEncodedOrigin.LeftBottom => new SKMatrix(0, 1, 0, -1, 0, info.Width, 0, 0, 1),
                _ => SKMatrix.Identity
            };
            canvas.Concat(orientation);
            using var image = SKImage.FromBitmap(decoded);
            canvas.DrawImage(image, 0, 0, new SKSamplingOptions(SKFilterMode.Linear));
        }
        using var result = SKImage.FromBitmap(resized);
        using var encoded = result.Encode(SKEncodedImageFormat.Jpeg, 85);
        return encoded.ToArray();
    }

    public static string? DataUrl(byte[]? photo) => photo is { Length: > 0 }
        ? "data:image/jpeg;base64," + Convert.ToBase64String(photo) : null;
}
