"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ROLES, type Role } from "@/lib/admin/roles";
import {
  TextField,
  PasswordInput,
  ToggleField,
  SaveButton,
  StatusMessage,
  IconButton,
  ErrorState,
  useRetryGuard,
  type SaveState,
} from "@/components/admin/ui";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  sales: "Sales",
  viewer: "Viewer",
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access — manages users, settings, and all CMS/media/leads.",
  admin: "Manages CMS, media, and leads. Cannot manage users or demote the owner.",
  editor: "Manages CMS pages and media. No access to users, settings, or leads.",
  sales: "Manages leads (status, notes, follow-up). No CMS/media/users/settings access.",
  viewer: "Read-only dashboard access.",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Never";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const selectCls =
  "w-full cursor-pointer rounded-xl border border-admin-border bg-admin-surface px-4 py-2.5 text-admin-body text-admin-text outline-none transition-colors duration-200 ease-admin focus:border-admin-accent/50 focus:bg-admin-surface-2 focus:ring-1 focus:ring-admin-accent/20";

function RoleSelect({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-admin-label font-medium text-admin-text-2">Role</span>
      <select value={value} onChange={(e) => onChange(e.target.value as Role)} className={selectCls}>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {ROLE_LABELS[r]}
          </option>
        ))}
      </select>
      <span className="text-admin-caption text-admin-text-3">{ROLE_DESCRIPTIONS[value]}</span>
    </label>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-admin-caption font-medium",
        isActive
          ? "border-admin-accent/25 bg-admin-accent/10 text-admin-accent"
          : "border-admin-border-strong bg-admin-surface-2 text-admin-text-3",
      ].join(" ")}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-admin-accent" : "bg-admin-text-3"}`} />
      {isActive ? "Active" : "Deactivated"}
    </span>
  );
}

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className="inline-flex items-center rounded-full border border-admin-border bg-admin-surface px-2.5 py-1 text-admin-caption font-medium text-admin-text/80">
      {ROLE_LABELS[role]}
    </span>
  );
}

// Overlay keeps its own backdrop-blur (real hierarchy: dims/separates the
// page behind the dialog); the panel itself is a solid admin-surface-2, not
// `.glass` — blurring an already-blurred backdrop a second time added no
// visible difference and cost an extra composited layer for no reason.
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-admin-border bg-admin-surface-2 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-admin-subhead font-semibold text-admin-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-admin-text-2 transition-colors duration-200 ease-admin hover:bg-admin-surface-3 hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Create user ──────────────────────────────────────────────────────────────

type PasswordFieldErrors = { password?: string; confirmPassword?: string };

function CreateUserPanel({ onCreated }: { onCreated: (user: UserRow) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [isActive, setIsActive] = useState(true);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PasswordFieldErrors>({});

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("viewer");
    setIsActive(true);
    setState("idle");
    setError(null);
    setFieldErrors({});
  }

  async function handleCreate() {
    // Same two rules as before — just surfaced at the specific field now,
    // in addition to the existing summary banner below.
    const nextFieldErrors: PasswordFieldErrors = {};
    if (password.length < 8) nextFieldErrors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) nextFieldErrors.confirmPassword = "Passwords do not match.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setState("error");
      setError("Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, is_active: isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create user.");

      onCreated(data as UserRow);
      reset();
      setOpen(false);
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Could not create user.");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-neon to-neon-soft px-5 py-2.5 text-admin-body font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(13,253,209,0.55)] transition-shadow duration-200 ease-admin hover:shadow-[0_14px_50px_-8px_rgba(13,253,209,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg"
      >
        + New user
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-admin-border glass p-5 sm:p-7">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-admin-subhead font-semibold text-admin-text">Create user</h2>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-admin-label text-admin-text-2 transition-colors duration-200 ease-admin hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/40 rounded"
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <TextField label="Name" value={name} onChange={setName} placeholder="Jane Doe" required />
        <TextField label="Email" value={email} onChange={setEmail} placeholder="jane@netlink.com" required />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordInput
            label="Password"
            value={password}
            onChange={(v) => {
              setPassword(v);
              setFieldErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
            }}
            placeholder="Min. 8 characters"
            required
            error={fieldErrors.password}
          />
          <PasswordInput
            label="Confirm password"
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setFieldErrors((prev) => (prev.confirmPassword ? { ...prev, confirmPassword: undefined } : prev));
            }}
            required
            error={fieldErrors.confirmPassword}
          />
        </div>
        <RoleSelect value={role} onChange={setRole} />
        <ToggleField label="Active" checked={isActive} onChange={setIsActive} />
        <StatusMessage state={state} error={error} />
        <div>
          <SaveButton state={state} label="Create user" onClick={handleCreate} />
        </div>
      </div>
    </section>
  );
}

// ── Edit user modal ──────────────────────────────────────────────────────────

function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: UserRow;
  onClose: () => void;
  onSaved: (user: UserRow) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<Role>(user.role);
  const [isActive, setIsActive] = useState(user.is_active);
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setState("saving");
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, is_active: isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save changes.");
      onSaved(data as UserRow);
      onClose();
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Could not save changes.");
    }
  }

  return (
    <Modal title="Edit user" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <TextField label="Name" value={name} onChange={setName} required />
        <TextField label="Email" value={email} onChange={setEmail} required />
        <RoleSelect value={role} onChange={setRole} />
        <ToggleField label="Active" checked={isActive} onChange={setIsActive} />
        <StatusMessage state={state} error={error} />
        <div className="flex justify-end gap-2">
          <IconButton label="Cancel" onClick={onClose} />
          <SaveButton state={state} label="Save changes" onClick={handleSave} />
        </div>
      </div>
    </Modal>
  );
}

// ── Change password modal ────────────────────────────────────────────────────

function ChangePasswordModal({ user, onClose }: { user: UserRow; onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [state, setState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<PasswordFieldErrors>({});

  async function handleChangePassword() {
    const nextFieldErrors: PasswordFieldErrors = {};
    if (password.length < 8) nextFieldErrors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) nextFieldErrors.confirmPassword = "Passwords do not match.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setState("error");
      setError("Please fix the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setState("saving");
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change password.");
      setState("saved");
      setTimeout(onClose, 700);
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : "Could not change password.");
    }
  }

  return (
    <Modal title={`Change password — ${user.name}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <PasswordInput
          label="New password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setFieldErrors((prev) => (prev.password ? { ...prev, password: undefined } : prev));
          }}
          placeholder="Min. 8 characters"
          required
          error={fieldErrors.password}
        />
        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setFieldErrors((prev) => (prev.confirmPassword ? { ...prev, confirmPassword: undefined } : prev));
          }}
          required
          error={fieldErrors.confirmPassword}
        />
        <StatusMessage state={state} error={error} />
        <div className="flex justify-end gap-2">
          <IconButton label="Cancel" onClick={onClose} />
          <SaveButton
            state={state}
            label="Change password"
            onClick={handleChangePassword}
          />
        </div>
      </div>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UsersManager({ currentUserId }: { currentUserId: string | null }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserRow | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Tracks the most recent load so a slower, superseded response can never
  // overwrite state set by a newer one, and aborts the in-flight request on
  // unmount or when a newer call starts.
  const requestRef = useRef<AbortController | null>(null);

  async function fetchUsers(signal: AbortSignal): Promise<UserRow[]> {
    const res = await fetch("/api/admin/users", { signal });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load users.");
    return data;
  }

  // The mount effect below calls fetchUsers directly (inline), not through a
  // hoisted function that itself setStates — eslint-plugin-react-hooks's
  // `set-state-in-effect` rule flags a hoisted function's synchronous
  // setState prefix as unsafe when the effect is its only caller. handleRetry
  // below duplicates a few lines rather than sharing this exact shape,
  // precisely to keep the effect's call site inline.
  useEffect(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    (async () => {
      try {
        const data = await fetchUsers(controller.signal);
        if (requestRef.current !== controller) return;
        setUsers(data);
        setLoadState("ready");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadState("error");
        setLoadError(e instanceof Error ? e.message : "Failed to load users.");
      }
    })();
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const { retrying, guardedRetry } = useRetryGuard();

  // Distinct from the mount load above: retry keeps loadState at "error" (so
  // ErrorState stays mounted with its own "Retrying…" state) instead of
  // flipping to the generic "loading" text.
  function handleRetry() {
    guardedRetry(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setLoadError(null);
      try {
        const data = await fetchUsers(controller.signal);
        if (requestRef.current !== controller) return;
        setUsers(data);
        setLoadState("ready");
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (requestRef.current !== controller) return;
        setLoadState("error");
        setLoadError(e instanceof Error ? e.message : "Failed to load users.");
      }
    });
  }

  const activeOwnerCount = users.filter((u) => u.role === "owner" && u.is_active).length;

  function upsertUser(user: UserRow) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
    });
  }

  async function toggleActive(user: UserRow) {
    setBusyId(user.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update user.");
      upsertUser(data as UserRow);
    } catch (e) {
      setRowError({ id: user.id, message: e instanceof Error ? e.message : "Could not update user." });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user: UserRow) {
    if (!window.confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;

    setBusyId(user.id);
    setRowError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete user.");
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (e) {
      setRowError({ id: user.id, message: e instanceof Error ? e.message : "Could not delete user." });
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-admin-h1 font-semibold text-admin-text">Users</h1>
          <p className="mt-1 text-admin-body text-admin-text-2">
            Manage who can sign in to this dashboard and what they can do. Only owners can see this page.
          </p>
        </div>
        <CreateUserPanel onCreated={upsertUser} />
      </div>

      {loadState === "loading" && <p className="text-admin-body text-admin-text-2">Loading users…</p>}
      {loadState === "error" && (
        <ErrorState message={loadError || "Could not load users."} onRetry={handleRetry} retrying={retrying} />
      )}

      {loadState === "ready" && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border glass">
          <table className="w-full min-w-[720px] text-left text-admin-body">
            <thead>
              <tr className="border-b border-admin-border text-admin-caption uppercase tracking-wide text-admin-text-3">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = currentUserId !== null && currentUserId === user.id;
                const isLastActiveOwner = user.role === "owner" && user.is_active && activeOwnerCount <= 1;
                const busy = busyId === user.id;

                return (
                  <tr key={user.id} className="border-b border-admin-border last:border-b-0">
                    <td className="px-4 py-3 font-medium text-admin-text">
                      {user.name}
                      {isSelf && <span className="ml-2 text-admin-caption text-admin-text-3">(you)</span>}
                    </td>
                    <td className="px-4 py-3 text-admin-text-2">{user.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-4 py-3 text-admin-caption text-admin-text-3">{formatDateTime(user.last_login_at)}</td>
                    <td className="px-4 py-3 text-admin-caption text-admin-text-3">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <IconButton label="Edit" onClick={() => setEditingUser(user)} />
                        <IconButton label="Password" onClick={() => setPasswordUser(user)} />
                        <IconButton
                          label={user.is_active ? "Deactivate" : "Activate"}
                          onClick={() => toggleActive(user)}
                        />
                        <IconButton
                          label="Delete"
                          variant="danger"
                          onClick={() => deleteUser(user)}
                        />
                      </div>
                      {busy && <p className="mt-1.5 text-admin-caption text-admin-text-3">Working…</p>}
                      {(isSelf || isLastActiveOwner) && (
                        <p className="mt-1.5 text-admin-caption text-admin-text-3">
                          {isSelf ? "You can't delete your own account. " : ""}
                          {isLastActiveOwner ? "Last active owner — can't be demoted/deactivated/deleted." : ""}
                        </p>
                      )}
                      {rowError?.id === user.id && (
                        <p role="alert" className="mt-1.5 text-admin-caption text-admin-danger">{rowError.message}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="px-4 py-10 text-center text-admin-body text-admin-text-2">No users yet — create the first one above.</p>
          )}
        </div>
      )}

      {editingUser && (
        <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSaved={upsertUser} />
      )}
      {passwordUser && <ChangePasswordModal user={passwordUser} onClose={() => setPasswordUser(null)} />}
    </div>
  );
}
