import { api } from "@/api/client";
import type {
  AdminGroupItem,
  CreateGroupPayload,
  GroupDetail,
  GroupInvitation,
  GroupProposal,
  OtaGroup,
  PaginatedResponse,
  PendingConnection,
} from "@/types/group";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  body?: T;
};

type ApiDataResponse<T> = ApiResponse<{ data: T }>;

const request = api.request;

export const groupService = {
  getMyGroups: async (): Promise<OtaGroup[]> => {
    const response = await request.request<ApiDataResponse<OtaGroup[]>>({
      method: "GET",
      url: "/api/group/my",
    });
    return response.body?.data ?? [];
  },

  getMyInvitations: async (): Promise<GroupInvitation[]> => {
    const response = await request.request<ApiDataResponse<GroupInvitation[]>>({
      method: "GET",
      url: "/api/group/invitations/my",
    });
    return response.body?.data ?? [];
  },

  createGroup: async (
    data: CreateGroupPayload,
  ): Promise<{ groupId: string } | undefined> => {
    const response = await request.request<ApiResponse<{ groupId: string }>>({
      method: "POST",
      url: "/api/group/create",
      formData: {
        name: data.name,
        description: data.description,
        criteria: data.criteria,
        transferDate: data.transferDate,
        pledgeAmount: data.pledgeAmount,
      },
      mediaType: "multipart/form-data",
    });

    return response.body;
  },

  getGroupDetail: async (id: string): Promise<GroupDetail> => {
    const response = await request.request<ApiResponse<GroupDetail>>({
      method: "GET",
      url: `/api/group/detail/${id}`,
    });

    if (!response.body) {
      throw new Error("Group detail is missing from response");
    }

    return response.body;
  },

  getProposals: async (groupId: string): Promise<GroupProposal[]> => {
    const response = await request.request<ApiDataResponse<GroupProposal[]>>({
      method: "GET",
      url: `/api/group/${groupId}/proposals`,
    });

    return response.body?.data ?? [];
  },

  proposeStudent: async (
    groupId: string,
    mahasiswaId: string,
  ): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: `/api/group/${groupId}/propose-student`,
      formData: { mahasiswaId },
      mediaType: "multipart/form-data",
    });
  },

  inviteMember: async (
    groupId: string,
    invitedOtaId: string,
  ): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: `/api/group/${groupId}/invite`,
      formData: { invitedOtaId },
      mediaType: "multipart/form-data",
    });
  },

  respondInvitation: async (
    invitationId: string,
    responseStatus: "accepted" | "rejected",
    pledgeAmount?: number,
  ): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: `/api/group/invitation/${invitationId}/respond`,
      formData: {
        response: responseStatus,
        ...(responseStatus === "accepted" && pledgeAmount !== undefined
          ? { pledgeAmount }
          : {}),
      },
      mediaType: "multipart/form-data",
    });
  },

  getAllGroups: async (params?: {
    q?: string;
    page?: number;
  }): Promise<PaginatedResponse<AdminGroupItem>> => {
    const response = await request.request<ApiResponse<PaginatedResponse<AdminGroupItem>>>({
      method: "GET",
      url: "/api/group/list",
      query: params,
    });

    return response.body ?? { data: [], totalData: 0 };
  },

  activateGroup: async (groupId: string): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: `/api/group/${groupId}/activate`,
    });
  },

  getPendingConnections: async (params?: {
    q?: string;
    page?: number;
  }): Promise<PaginatedResponse<PendingConnection>> => {
    const response = await request.request<ApiResponse<PaginatedResponse<PendingConnection>>>({
      method: "GET",
      url: "/api/group/connect/list/pending",
      query: params,
    });

    return response.body ?? { data: [], totalData: 0 };
  },

  verifyAcceptConnection: async (
    groupConnectionId: string,
  ): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: "/api/group/connect/verify-accept",
      formData: { groupConnectionId },
      mediaType: "multipart/form-data",
    });
  },

  verifyRejectConnection: async (
    groupConnectionId: string,
  ): Promise<ApiResponse<unknown>> => {
    return request.request<ApiResponse<unknown>>({
      method: "POST",
      url: "/api/group/connect/verify-reject",
      formData: { groupConnectionId },
      mediaType: "multipart/form-data",
    });
  },
};