import {
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';

import {
  Link,
} from 'react-router-dom';

import AdminHeader from '../../components/AdminHeader/AdminHeader';

import {
  useAdminManagement,
} from '../../context/AdminManagementContext';

import {
  AdminRole,
} from '../../types/admin';

import {
  AccountStatus,
} from '../../types/enums';

import styles from './AdminManagement.module.css';

interface FormValues {
  userName: string;
  email: string;
  status: AccountStatus;
  adminRole: AdminRole;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  userName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMPTY_FORM: FormValues = {
  userName: '',
  email: '',
  status: AccountStatus.Pending,
  adminRole: AdminRole.Admin,
  password: '',
  confirmPassword: '',
};

export default function AdminManagement() {
  const {
    admins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
  } = useAdminManagement();

  const [query, setQuery] =
    useState<string>('');

  const [isModalOpen, setIsModalOpen] =
    useState<boolean>(false);

  const [editingAdminId, setEditingAdminId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormValues>(
      EMPTY_FORM
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [deleteTarget, setDeleteTarget] =
    useState<string | null>(null);

  const filteredAdmins =
    useMemo(() => {
      const normalizedQuery =
        query.trim().toLowerCase();

      if (!normalizedQuery) {
        return admins;
      }

      return admins.filter(
        (admin) =>
          admin.userName
            .toLowerCase()
            .includes(normalizedQuery) ||
          admin.email
            .toLowerCase()
            .includes(normalizedQuery)
      );
    }, [admins, query]);

  const editingAdmin =
    editingAdminId
      ? admins.find(
          (admin) =>
            admin.adminId ===
            editingAdminId
        )
      : undefined;

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setQuery(event.target.value);
  };

  const openCreateModal = (): void => {
    setEditingAdminId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (
    adminId: string
  ): void => {
    const admin = admins.find(
      (entry) =>
        entry.adminId === adminId
    );

    if (!admin) {
      return;
    }

    setEditingAdminId(adminId);

    setForm({
      userName: admin.userName,
      email: admin.email,
      status: admin.status,
      adminRole: admin.adminRole,
      password: '',
      confirmPassword: '',
    });

    setErrors({});
    setIsModalOpen(true);
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setEditingAdminId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const handleFieldChange = (
    event: ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ): void => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === 'status' ||
        name === 'adminRole'
          ? Number(value)
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: undefined,
    }));
  };

  const validate =
    (): FormErrors => {
      const nextErrors: FormErrors =
        {};

      if (!form.userName.trim()) {
        nextErrors.userName =
          'Username is required.';
      } else if (
        form.userName.trim().length <
        3
      ) {
        nextErrors.userName =
          'Username must be at least 3 characters.';
      }

      if (!form.email.trim()) {
        nextErrors.email =
          'Email is required.';
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        nextErrors.email =
          'Enter a valid email address.';
      }

      /*
       * Password is required when creating
       * an admin, but not when editing.
       */
      if (!editingAdminId) {
        if (!form.password) {
          nextErrors.password =
            'Password is required.';
        } else if (
          form.password.length < 8
        ) {
          nextErrors.password =
            'Password must be at least 8 characters.';
        }

        if (
          form.password !==
          form.confirmPassword
        ) {
          nextErrors.confirmPassword =
            'Passwords do not match.';
        }
      } else if (
        form.password ||
        form.confirmPassword
      ) {
        if (form.password.length < 8) {
          nextErrors.password =
            'Password must be at least 8 characters.';
        }

        if (
          form.password !==
          form.confirmPassword
        ) {
          nextErrors.confirmPassword =
            'Passwords do not match.';
        }
      }

      return nextErrors;
    };

  const handleSubmit = (): void => {
    const validationErrors =
      validate();

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    if (editingAdminId) {
      updateAdmin(
        editingAdminId,
        {
          userName:
            form.userName.trim(),

          email:
            form.email.trim(),

          status:
            form.status,

          adminRole:
            form.adminRole,
        }
      );
    } else {
      createAdmin({
        userName:
          form.userName.trim(),

        email:
          form.email.trim(),

        status:
          form.status,

        adminRole:
          form.adminRole,
      });
    }

    closeModal();
  };

  const handleDelete = (): void => {
    if (!deleteTarget) {
      return;
    }

    deleteAdmin(deleteTarget);
    setDeleteTarget(null);
  };

  return (
    <div className={styles.page}>
      <AdminHeader />

      <main className={styles.main}>
        <Link
          to="/super-admin"
          className={styles.backLink}
        >
          ← Back to Super Admin
        </Link>

        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              Super Administration
            </span>

            <h1 className={styles.title}>
              Admin Accounts
            </h1>

            <p className={styles.subtitle}>
              Create and manage administrator
              accounts.
            </p>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={openCreateModal}
          >
            + Create Admin
          </button>
        </div>

        <div className={styles.toolbar}>
          <input
            type="search"
            value={query}
            onChange={handleSearchChange}
            placeholder="Search username or email..."
            className={styles.searchInput}
          />
        </div>

        {filteredAdmins.length === 0 ? (
          <section className={styles.empty}>
            <h2>
              No Admin Accounts
            </h2>

            <p>
              Create an administrator account
              to get started.
            </p>
          </section>
        ) : (
          <section className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAdmins.map(
                  (admin) => (
                    <tr key={admin.adminId}>
                      <td>
                        <strong>
                          {admin.userName}
                        </strong>
                      </td>

                      <td>
                        {admin.email}
                      </td>

                      <td>
                        {admin.adminRole ===
                        AdminRole.SuperAdmin
                          ? 'Super Admin'
                          : 'Admin'}
                      </td>

                      <td>
                        <span
                          className={
                            styles.status
                          }
                        >
                          {admin.status ===
                          AccountStatus.Active
                            ? 'Active'
                            : admin.status ===
                              AccountStatus.InActive
                              ? 'Inactive'
                              : 'Pending'}
                        </span>
                      </td>

                      <td>
                        <div
                          className={
                            styles.actions
                          }
                        >
                          <button
                            type="button"
                            className={
                              styles.editButton
                            }
                            onClick={() =>
                              openEditModal(
                                admin.adminId
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={
                              styles.deleteButton
                            }
                            onClick={() =>
                              setDeleteTarget(
                                admin.adminId
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </section>
        )}
      </main>

      {isModalOpen && (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  {editingAdmin
                    ? 'Edit Account'
                    : 'New Account'}
                </span>

                <h2
                  id="admin-modal-title"
                  className={styles.modalTitle}
                >
                  {editingAdmin
                    ? 'Edit Admin'
                    : 'Create Admin'}
                </h2>
              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <label className={styles.label}>
              Username

              <input
                name="userName"
                type="text"
                value={form.userName}
                onChange={handleFieldChange}
                className={`${styles.input} ${
                  errors.userName
                    ? styles.inputError
                    : ''
                }`}
              />

              {errors.userName && (
                <span
                  className={
                    styles.errorText
                  }
                >
                  {errors.userName}
                </span>
              )}
            </label>

            <label className={styles.label}>
              Email

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleFieldChange}
                className={`${styles.input} ${
                  errors.email
                    ? styles.inputError
                    : ''
                }`}
              />

              {errors.email && (
                <span
                  className={
                    styles.errorText
                  }
                >
                  {errors.email}
                </span>
              )}
            </label>

            <label className={styles.label}>
              Admin Role

              <select
                name="adminRole"
                value={form.adminRole}
                onChange={handleFieldChange}
                className={styles.input}
              >
                <option
                  value={AdminRole.Admin}
                >
                  Admin
                </option>

                <option
                  value={
                    AdminRole.SuperAdmin
                  }
                >
                  Super Admin
                </option>
              </select>
            </label>

            <label className={styles.label}>
              Status

              <select
                name="status"
                value={form.status}
                onChange={handleFieldChange}
                className={styles.input}
              >
                <option
                  value={
                    AccountStatus.Pending
                  }
                >
                  Pending
                </option>

                <option
                  value={
                    AccountStatus.Active
                  }
                >
                  Active
                </option>

                <option
                  value={
                    AccountStatus.InActive
                  }
                >
                  Inactive
                </option>
              </select>
            </label>

            <label className={styles.label}>
              {editingAdmin
                ? 'New Password (optional)'
                : 'Password'}

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleFieldChange}
                className={`${styles.input} ${
                  errors.password
                    ? styles.inputError
                    : ''
                }`}
                autoComplete={
                  editingAdmin
                    ? 'new-password'
                    : 'new-password'
                }
              />

              {errors.password && (
                <span
                  className={
                    styles.errorText
                  }
                >
                  {errors.password}
                </span>
              )}
            </label>

            <label className={styles.label}>
              {editingAdmin
                ? 'Confirm New Password'
                : 'Confirm Password'}

              <input
                name="confirmPassword"
                type="password"
                value={
                  form.confirmPassword
                }
                onChange={handleFieldChange}
                className={`${styles.input} ${
                  errors.confirmPassword
                    ? styles.inputError
                    : ''
                }`}
                autoComplete="new-password"
              />

              {errors.confirmPassword && (
                <span
                  className={
                    styles.errorText
                  }
                >
                  {errors.confirmPassword}
                </span>
              )}
            </label>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={closeModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.saveButton
                }
                onClick={handleSubmit}
              >
                {editingAdmin
                  ? 'Save Changes'
                  : 'Create Admin'}
              </button>
            </div>
          </section>
        </div>
      )}

      {deleteTarget && (
        <div
          className={styles.overlay}
          role="presentation"
        >
          <section
            className={styles.confirmModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-admin-title"
          >
            <h2
              id="delete-admin-title"
              className={styles.modalTitle}
            >
              Delete Admin?
            </h2>

            <p className={styles.confirmText}>
              This will permanently remove the
              administrator account from the
              frontend account store.
            </p>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.deleteConfirmButton
                }
                onClick={handleDelete}
              >
                Yes, Delete
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}