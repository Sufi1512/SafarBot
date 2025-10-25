/**
 * React Query hooks for SafarBot API
 * Replaces manual state management with intelligent caching and background updates
 */

import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryResult,
  UseMutationResult 
} from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from '../lib/queryClient';
import { 
  savedItineraryAPI, 
  dashboardAPI, 
  weatherAPI, 
  flightAPI, 
  hotelAPI, 
  restaurantAPI, 
  chatAPI, 
  collaborationAPI, 
  authAPI, 
  alertsAPI 
} from '../services/cachedApi';
import { useToast } from '../contexts/ToastContext';

// Dashboard Hooks
export const useDashboardData = () => {
  return useQuery({
    queryKey: queryKeys.dashboardData(),
    queryFn: dashboardAPI.getDashboardData,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: dashboardAPI.getStats,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Saved Itineraries Hooks
export const useSavedItineraries = (params?: {
  limit?: number;
  skip?: number;
  status?: 'draft' | 'published' | 'archived';
  is_favorite?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.savedItinerariesList(params),
    queryFn: () => savedItineraryAPI.getItineraries(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSavedItinerary = (itineraryId: string) => {
  return useQuery({
    queryKey: queryKeys.savedItinerary(itineraryId),
    queryFn: () => savedItineraryAPI.getItinerary(itineraryId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!itineraryId,
  });
};

export const useCreateItinerary = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: savedItineraryAPI.createItinerary,
    onSuccess: (data) => {
      // Invalidate and refetch saved itineraries
      invalidateQueries.savedItineraries();
      invalidateQueries.dashboard();
      
      addToast({
        type: 'success',
        title: 'Itinerary Created',
        message: 'Your itinerary has been saved successfully!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Creation Failed',
        message: error?.response?.data?.detail || 'Failed to create itinerary'
      });
    },
  });
};

export const useUpdateItinerary = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: ({ itineraryId, updateData }: { itineraryId: string; updateData: any }) =>
      savedItineraryAPI.updateItinerary(itineraryId, updateData),
    onSuccess: (data, variables) => {
      // Update specific itinerary in cache
      queryClient.setQueryData(
        queryKeys.savedItinerary(variables.itineraryId),
        data
      );
      
      // Invalidate list to ensure consistency
      invalidateQueries.savedItineraries();
      
      addToast({
        type: 'success',
        title: 'Itinerary Updated',
        message: 'Your changes have been saved!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error?.response?.data?.detail || 'Failed to update itinerary'
      });
    },
  });
};

export const useDeleteItinerary = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: savedItineraryAPI.deleteItinerary,
    onSuccess: (data, itineraryId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.savedItinerary(itineraryId) });
      invalidateQueries.savedItineraries();
      invalidateQueries.dashboard();
      
      addToast({
        type: 'success',
        title: 'Itinerary Deleted',
        message: 'Itinerary has been removed successfully'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: error?.response?.data?.detail || 'Failed to delete itinerary'
      });
    },
  });
};

// Weather Hooks
export const useCurrentWeather = (city: string, countryCode?: string) => {
  return useQuery({
    queryKey: queryKeys.currentWeather(city, countryCode),
    queryFn: () => weatherAPI.getCurrentWeather(city, countryCode),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!city,
  });
};

export const useWeatherForecast = (city: string, countryCode?: string, days: number = 5) => {
  return useQuery({
    queryKey: queryKeys.weatherForecast(city, countryCode, days),
    queryFn: () => weatherAPI.getWeatherForecast(city, countryCode, days),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!city,
  });
};

// Flight Hooks
export const useFlightSearch = (searchParams: any, enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.flightSearch(searchParams),
    queryFn: () => flightAPI.searchFlights(searchParams),
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: enabled && !!searchParams?.departure && !!searchParams?.arrival,
  });
};

export const usePopularFlights = () => {
  return useQuery({
    queryKey: queryKeys.popularFlights(),
    queryFn: flightAPI.getPopularFlights,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useAirportSuggestions = (query: string) => {
  return useQuery({
    queryKey: queryKeys.airportSuggestions(query),
    queryFn: () => flightAPI.getAirportSuggestions(query),
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: query.length >= 2,
  });
};

// Hotel Hooks
export const useHotelSearch = (searchParams: any, enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.hotelSearch(searchParams),
    queryFn: () => hotelAPI.searchHotels(searchParams),
    staleTime: 20 * 60 * 1000, // 20 minutes
    enabled: enabled && !!searchParams?.location,
  });
};

// Restaurant Hooks
export const useRestaurantRecommendations = (params: any, enabled: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.restaurantRecommendations(params),
    queryFn: () => restaurantAPI.getRecommendations(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: enabled && !!params?.location,
  });
};

// Chat Hooks
export const useChatHistory = () => {
  return useQuery({
    queryKey: queryKeys.chatHistory(),
    queryFn: chatAPI.getHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: () => {
      // Invalidate chat history to fetch new messages
      queryClient.invalidateQueries({ queryKey: queryKeys.chatHistory() });
    },
  });
};

// Collaboration Hooks
export const useCollaborationInvitations = () => {
  return useQuery({
    queryKey: queryKeys.collaborationInvitations(),
    queryFn: collaborationAPI.getInvitations,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useMyCollaborations = () => {
  return useQuery({
    queryKey: queryKeys.myCollaborations(),
    queryFn: collaborationAPI.getMyCollaborations,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInviteCollaborator = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: collaborationAPI.inviteCollaborator,
    onSuccess: () => {
      invalidateQueries.collaboration();
      addToast({
        type: 'success',
        title: 'Invitation Sent',
        message: 'Collaboration invitation has been sent successfully!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Invitation Failed',
        message: error?.response?.data?.detail || 'Failed to send invitation'
      });
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: collaborationAPI.acceptInvitation,
    onSuccess: () => {
      invalidateQueries.collaboration();
      invalidateQueries.savedItineraries();
      addToast({
        type: 'success',
        title: 'Invitation Accepted',
        message: 'You are now collaborating on this itinerary!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Failed to Accept',
        message: error?.response?.data?.detail || 'Failed to accept invitation'
      });
    },
  });
};

// User Profile Hooks
export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: authAPI.getProfile,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.userProfile(), data);
      invalidateQueries.user();
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: error?.response?.data?.detail || 'Failed to update profile'
      });
    },
  });
};

// Alerts Hooks
export const useAlerts = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.alertsList(params),
    queryFn: () => alertsAPI.getAlerts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateAlert = () => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: alertsAPI.createAlert,
    onSuccess: () => {
      invalidateQueries.alerts();
      addToast({
        type: 'success',
        title: 'Alert Created',
        message: 'Price alert has been set up successfully!'
      });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        title: 'Alert Failed',
        message: error?.response?.data?.detail || 'Failed to create alert'
      });
    },
  });
};

// Optimistic Updates Hook
export const useOptimisticUpdate = <T>() => {
  const queryClient = useQueryClient();

  const updateOptimistically = async (
    queryKey: unknown[],
    updateFn: (oldData: T) => T,
    mutationFn: () => Promise<T>
  ) => {
    // Cancel any outgoing refetches
    await queryClient.cancelQueries({ queryKey });

    // Snapshot the previous value
    const previousData = queryClient.getQueryData<T>(queryKey);

    // Optimistically update
    queryClient.setQueryData(queryKey, updateFn);

    try {
      // Perform the mutation
      const result = await mutationFn();
      
      // Update with real data
      queryClient.setQueryData(queryKey, result);
      
      return result;
    } catch (error) {
      // Rollback on error
      queryClient.setQueryData(queryKey, previousData);
      throw error;
    }
  };

  return { updateOptimistically };
};

// Background sync for offline support
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();

  const syncOnReconnect = () => {
    window.addEventListener('online', () => {
      queryClient.refetchQueries({
        predicate: (query) => query.state.status === 'error'
      });
    });
  };

  const syncCriticalData = () => {
    const criticalQueries = [
      queryKeys.dashboardData(),
      queryKeys.userProfile(),
      queryKeys.savedItinerariesList(),
    ];

    criticalQueries.forEach(queryKey => {
      queryClient.refetchQueries({ queryKey });
    });
  };

  return { syncOnReconnect, syncCriticalData };
};

export default {
  useDashboardData,
  useSavedItineraries,
  useCurrentWeather,
  useFlightSearch,
  // ... export all hooks
};








