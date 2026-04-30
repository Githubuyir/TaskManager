import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components/ui';
import { userService } from '../../services/userService';
import { InviteModal } from '../../components/modals/InviteModal';
import { useAuth } from '../../contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Member {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status?: string;
  createdAt?: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastId = 0;

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className={`pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all animate-in slide-in-from-bottom-2 duration-300 ${
          t.type === 'success'
            ? 'bg-emerald-500 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {t.type === 'success' ? 'check_circle' : 'error'}
        </span>
        {t.message}
        <button
          className="ml-2 opacity-70 hover:opacity-100"
          onClick={() => onRemove(t.id)}
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    ))}
  </div>
);

// ─── Profile Modal ─────────────────────────────────────────────────────────────
const ProfileModal = ({ member, onClose }: { member: Member; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-extrabold text-brand-on-surface">Member Profile</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[20px] text-brand-on-surface-variant">close</span>
        </button>
      </div>

      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 ring-2 ring-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-lg">
          {member.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div>
          <p className="text-lg font-extrabold text-brand-on-surface">{member.name}</p>
          <p className="text-sm text-brand-on-surface-variant">{member.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Role', value: member.role === 'admin' ? 'Admin' : 'Member', icon: 'shield' },
          { label: 'Status', value: member.status || 'Active', icon: 'circle' },
          {
            label: 'Joined',
            value: member.createdAt
              ? new Date(member.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'N/A',
            icon: 'calendar_month',
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4 p-4 bg-brand-surface-container-low rounded-2xl">
            <span className="material-symbols-outlined text-[20px] text-brand-primary">{row.icon}</span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">{row.label}</p>
              <p className="text-sm font-bold text-brand-on-surface capitalize">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onClose} className="mt-6 w-full" variant="secondary">Close</Button>
    </div>
  </div>
);

// ─── Change Role Modal ──────────────────────────────────────────────────────────
const ChangeRoleModal = ({
  member,
  onClose,
  onConfirm,
  isLoading,
}: {
  member: Member;
  onClose: () => void;
  onConfirm: (role: 'admin' | 'member') => void;
  isLoading: boolean;
}) => {
  const [selected, setSelected] = useState<'admin' | 'member'>(member.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-extrabold text-brand-on-surface">Change Role</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-brand-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px] text-brand-on-surface-variant">close</span>
          </button>
        </div>

        <p className="text-sm text-brand-on-surface-variant mb-6">
          Update the role for <span className="font-bold text-brand-on-surface">{member.name}</span>.
        </p>

        <div className="space-y-3 mb-8">
          {(['member', 'admin'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setSelected(role)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selected === role
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-brand-outline-variant/20 hover:border-brand-outline-variant/40'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[22px] ${
                  selected === role ? 'text-brand-primary' : 'text-brand-on-surface-variant'
                }`}
              >
                {role === 'admin' ? 'admin_panel_settings' : 'person'}
              </span>
              <div>
                <p className={`text-sm font-bold capitalize ${selected === role ? 'text-brand-primary' : 'text-brand-on-surface'}`}>
                  {role}
                </p>
                <p className="text-xs text-brand-on-surface-variant">
                  {role === 'admin' ? 'Full workspace control' : 'Standard access'}
                </p>
              </div>
              {selected === role && (
                <span className="material-symbols-outlined text-brand-primary ml-auto text-[20px]">check_circle</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(selected)}
            className="flex-1 btn-primary-gradient"
            disabled={isLoading || selected === member.role}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                Saving…
              </span>
            ) : (
              'Save Role'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ─── Remove Confirmation Modal ──────────────────────────────────────────────────
const RemoveConfirmModal = ({
  member,
  onClose,
  onConfirm,
  isLoading,
}: {
  member: Member;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
    <div
      className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 p-8 animate-in zoom-in-95 duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-red-500 text-[24px]">person_remove</span>
        </div>
        <h2 className="text-xl font-extrabold text-brand-on-surface">Remove Member</h2>
      </div>

      <p className="text-sm text-brand-on-surface-variant mb-8">
        Are you sure you want to remove{' '}
        <span className="font-bold text-brand-on-surface">{member.name}</span> from the workspace?
        This action cannot be undone.
      </p>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="secondary" className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-colors disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
              Removing…
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Remove
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// ─── Row Action Dropdown ────────────────────────────────────────────────────────
const ActionDropdown = ({
  member,
  onViewProfile,
  onChangeRole,
  onRemove,
}: {
  member: Member;
  onViewProfile: () => void;
  onChangeRole: () => void;
  onRemove: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const actions = [
    { label: 'View Profile', icon: 'person', action: onViewProfile },
    { label: 'Change Role', icon: 'manage_accounts', action: onChangeRole },
    { label: 'Remove from Workspace', icon: 'person_remove', action: onRemove, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-10 h-10 hover:bg-brand-surface-container-highest rounded-full text-brand-on-surface-variant flex items-center justify-center transition-colors"
        aria-label="Member actions"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-30 w-52 bg-white rounded-2xl shadow-2xl ring-1 ring-brand-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-150 origin-top-right">
          {actions.map((a) => (
            <button
              key={a.label}
              onClick={() => { setOpen(false); a.action(); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
                a.danger
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-brand-on-surface hover:bg-brand-surface-container-low'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${a.danger ? 'text-red-400' : 'text-brand-primary'}`}>
                {a.icon}
              </span>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CSV Export Helper ──────────────────────────────────────────────────────────
const exportToCSV = (members: Member[]) => {
  const headers = ['Name', 'Email', 'Role', 'Status', 'Joined On'];
  const rows = members.map((m) => [
    `"${m.name}"`,
    `"${m.email}"`,
    m.role,
    m.status || 'Active',
    m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US') : 'N/A',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'team-members.csv';
  link.click();
  URL.revokeObjectURL(url);
};

// ─── Main Component ─────────────────────────────────────────────────────────────
const AdminTeam = () => {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modal states
  const [profileMember, setProfileMember] = useState<Member | null>(null);
  const [changeRoleMember, setChangeRoleMember] = useState<Member | null>(null);
  const [removeMember, setRemoveMember] = useState<Member | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const addToast = (message: string, type: 'success' | 'error') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getWorkspaceMembers();
      setMembers(data);
      setFilteredMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
      addToast('Failed to load team members.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredMembers(
      members.filter(
        (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, members]);

  // ── Handle Change Role ────────────────────────────────────────────────────────
  const handleChangeRole = async (newRole: 'admin' | 'member') => {
    if (!changeRoleMember) return;
    setActionLoading(true);
    try {
      await userService.updateMemberRole(changeRoleMember._id, newRole);
      setMembers((prev) =>
        prev.map((m) => (m._id === changeRoleMember._id ? { ...m, role: newRole } : m))
      );
      addToast(`${changeRoleMember.name}'s role updated to ${newRole}.`, 'success');
      setChangeRoleMember(null);
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to update role.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Remove Member ──────────────────────────────────────────────────────
  const handleRemoveMember = async () => {
    if (!removeMember) return;
    setActionLoading(true);
    try {
      await userService.removeMember(removeMember._id);
      setMembers((prev) => prev.filter((m) => m._id !== removeMember._id));
      addToast(`${removeMember.name} removed from workspace.`, 'success');
      setRemoveMember(null);
    } catch (err: any) {
      addToast(err?.response?.data?.message || 'Failed to remove member.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-brand-on-background">Team Management</h1>
          <p className="text-brand-on-surface-variant">Invite members and manage permissions for your workspace.</p>
        </div>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="gap-2 btn-primary-gradient shadow-lg shadow-brand-primary/20"
        >
          <span className="material-symbols-outlined text-[20px]">person_add</span> Invite Member
        </Button>
      </div>

      {/* Table Card */}
      <div className="bg-brand-surface-container-lowest rounded-brand-full shadow-sm ring-1 ring-brand-outline-variant/10 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-brand-outline-variant/5 flex flex-col md:flex-row justify-between items-center bg-brand-surface-container-low/30 gap-4">
          <div className="relative w-full md:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-brand-on-surface-variant text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white rounded-brand-xl text-sm border border-brand-outline-variant/20 focus:ring-2 focus:ring-brand-primary/20 outline-none w-full md:w-72 transition-all focus:border-brand-primary/30"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 md:flex-none"
              onClick={() => exportToCSV(filteredMembers)}
            >
              <span className="material-symbols-outlined text-[18px] mr-2">download</span> Export
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-surface-container-low/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Member Details</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Security Role</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant">Joined On</th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-brand-on-surface-variant"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-outline-variant/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-brand-on-surface-variant italic">
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                      Loading directory…
                    </span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-brand-on-surface-variant italic">
                    {searchQuery ? 'No members match your search.' : 'No members found in this workspace.'}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, i) => {
                  const isSelf = currentUser?._id === member._id;
                  return (
                    <tr key={member._id || i} className="group hover:bg-brand-surface-container-low transition-colors">
                      {/* Name + Email */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-brand-xl bg-brand-primary/5 ring-1 ring-brand-primary/10 flex items-center justify-center text-brand-primary font-black text-xs shadow-sm">
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-brand-on-surface">
                              {member.name}
                              {isSelf && (
                                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                                  you
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-brand-on-surface-variant">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-8 py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface-container-high text-xs font-bold text-brand-on-surface ring-1 ring-brand-outline-variant/10">
                          <span className="material-symbols-outlined text-[14px] text-brand-primary">verified_user</span>
                          <span className="capitalize">{member.role || 'Member'}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ring-4 ring-offset-0 ${
                            member.status === 'Away' ? 'bg-amber-500 ring-amber-500/10' :
                            member.status === 'Offline' ? 'bg-brand-outline-variant ring-brand-outline-variant/10' :
                            'bg-green-500 ring-green-500/10'
                          }`} />
                          <span className="text-xs font-bold text-brand-on-surface">{member.status || 'Active'}</span>
                        </div>
                      </td>

                      {/* Joined On */}
                      <td className="px-8 py-5 text-xs font-medium text-brand-on-surface-variant">
                        {member.createdAt
                          ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        {isSelf ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface-container-high text-xs font-semibold text-brand-on-surface-variant ring-1 ring-brand-outline-variant/10">
                            <span className="material-symbols-outlined text-[14px]">verified_user</span>
                            You (Admin)
                          </span>
                        ) : (
                          <ActionDropdown
                            member={member}
                            onViewProfile={() => setProfileMember(member)}
                            onChangeRole={() => setChangeRoleMember(member)}
                            onRemove={() => setRemoveMember(member)}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-outline-variant/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-on-surface-variant">
            Directory: {filteredMembers.length} {filteredMembers.length !== members.length ? `of ${members.length}` : 'Total'} Members
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled className="px-6">Prev</Button>
            <Button variant="secondary" size="sm" className="px-6">Next</Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {profileMember && (
        <ProfileModal member={profileMember} onClose={() => setProfileMember(null)} />
      )}
      {changeRoleMember && (
        <ChangeRoleModal
          member={changeRoleMember}
          onClose={() => setChangeRoleMember(null)}
          onConfirm={handleChangeRole}
          isLoading={actionLoading}
        />
      )}
      {removeMember && (
        <RemoveConfirmModal
          member={removeMember}
          onClose={() => setRemoveMember(null)}
          onConfirm={handleRemoveMember}
          isLoading={actionLoading}
        />
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={fetchMembers}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminTeam;
