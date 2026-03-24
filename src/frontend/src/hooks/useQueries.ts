import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  LeadInput,
  LeadStatus,
  LeadUpdateInput,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";

export function useStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useLeads() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLead(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["lead", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getLead(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useSuggestions(leadId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["suggestions", leadId?.toString()],
    queryFn: async () => {
      if (!actor || leadId === null) return [];
      return actor.getSuggestions(leadId);
    },
    enabled: !!actor && !isFetching && leadId !== null,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeadInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createLead(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LeadUpdateInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLead(input);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({
        queryKey: ["lead", variables.id.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateLeadStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      status,
    }: { leadId: bigint; status: LeadStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLeadStatus(leadId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({
        queryKey: ["lead", variables.leadId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (leadId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLead(leadId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useAddNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leadId,
      noteText,
    }: { leadId: bigint; noteText: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addLeadNote(leadId, noteText);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lead", variables.leadId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
