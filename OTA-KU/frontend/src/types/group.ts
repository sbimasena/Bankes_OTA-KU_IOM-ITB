// src/types/group.ts

export type OtaGroupStatus = 'forming' | 'active';
export type ProposalStatus = 'open' | 'failed' | 'passed' | 'approved' | 'rejected';

export interface ProposalVote {
  otaId: string;
  otaName: string;
  approve: boolean;
  pledgeAmount: number;
}

export interface GroupProposal {
  id: string;
  mahasiswaId: string;
  mahasiswaName: string;
  mahasiswaNim: string;
  proposedById: string | null;
  proposedByName: string | null;
  status: ProposalStatus;
  votes: ProposalVote[];
  totalPledge: number;
  memberCount: number;
  createdAt: string;
}

export interface OtaGroup {
  groupId: string;
  groupName: string;
  groupStatus: OtaGroupStatus;
  memberCount: number;
  activeConnectionCount: number;
  joinedAt: string;
}

export interface GroupInvitation {
  invitationId: string;
  groupId: string;
  groupName: string;
  groupStatus: OtaGroupStatus;
  invitedByName: string | null;
  memberCount: number;
  totalPledge: number;
  createdAt: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  criteria?: string;
  transferDate?: number;
  pledgeAmount: number;
}

export interface GroupMember {
  otaId: string;
  name: string;
  pledgeAmount: number;
  joinedAt: string;
}

export interface GroupStudentConnection {
  connectionId: string;
  mahasiswaId: string;
  mahasiswaName: string;
  mahasiswaNim: string;
  connectionStatus: "accepted" | "pending" | "rejected";
  createdAt: string;
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  status: OtaGroupStatus;
  criteria: string | null;
  transferDate: number | null;
  createdAt: string;
  members: GroupMember[];
  pendingInvitations: { invitationId: string; invitedOtaId: string; invitedOtaName: string }[];
  students: GroupStudentConnection[];
  activeConnectionCount: number;
  totalPledge: number;
}

export interface AdminGroupItem {
  id: string;
  name: string;
  status: OtaGroupStatus;
  memberCount: number;
  activeConnectionCount: number;
  totalPledge: number;
  createdAt: string;
}

export interface PendingConnection {
  id: string;
  mahasiswaId: string;
  mahasiswaName: string;
  mahasiswaNim: string;
  groupId: string;
  groupName: string;
  connectionStatus: string;
  paidFor: number;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalData: number;
}

export interface MaOtaGroupMember {
  otaId: string;
  name: string;
  email: string;
  phoneNumber: string;
  isDetailVisible: boolean;
  pledgeAmount: number;
  joinedAt: string;
}

export interface MaOtaGroup {
  groupId: string;
  groupName: string;
  groupStatus: OtaGroupStatus;
  transferDate: number | null;
  members: MaOtaGroupMember[];
}

export interface AutoPairSuggestion {
  mahasiswaId: string;
  nim: string;
  name: string;
  major: string | null;
  description: string | null;
  groupId: string;
  groupName: string;
}

export interface OpenGroupMember {
  otaId: string;
  name: string;
}

export interface OpenGroup {
  id: string;
  name: string;
  description: string | null;
  criteria: string | null;
  memberCount: number;
  totalPledge: number;
  members: OpenGroupMember[];
  createdAt: string;
}