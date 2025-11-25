import { create, StateCreator } from "zustand";
import { supabase } from "../utils/supabase";
import { useAuth } from "../context/AuthContext"; 

export interface PracticeLog {
  id: string;
  user_id: string; 
  duration_minutes: number;
  description: string;
  practice_date: string; 
  created_at: string;
  // Datos específicos de respiración
  breathing_cycles?: number;
  breathing_avg_stability?: number;
  breathing_peak_stability?: number;
  breathing_max_rms?: number;
}

type PracticeStore = {
  logs: PracticeLog[];
  isLogsLoading: boolean;
  
  loadLogs: (userId: string) => Promise<void>;
  addLog: (userId: string, duration: number, description: string, breathingData?: {
    cycles: number;
    avgStability: number;
    peakStability: number;
    maxRMS: number;
  }) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
};

const storeCreator: StateCreator<PracticeStore> = (set, get) => ({
  logs: [],
  isLogsLoading: false,

  loadLogs: async (userId: string) => {
    if (!userId) {
      set({ logs: [], isLogsLoading: false });
      return;
    }
    
    set({ isLogsLoading: true });
    try {
      const { data, error } = await supabase
        .from("practice_logs")
        .select("*")
        .eq("user_id", userId)
        .order("practice_date", { ascending: false }); 
        
      if (error) {
        // Supabase Error al cargar logs
      }
      set({ logs: data as PracticeLog[] ?? [] });
    } catch (error) {
      // Excepción al cargar logs
    } finally {
      set({ isLogsLoading: false });
    }
  },

  addLog: async (userId: string, duration: number, description: string, breathingData?: {
    cycles: number;
    avgStability: number;
    peakStability: number;
    maxRMS: number;
  }) => {
    if (!userId) {
      // Usuario no autenticado para agregar log.
      return;
    }

    try {
      // Supabase espera `duration_minutes` como integer en la tabla.
      // Normalizamos el valor a entero redondeando para evitar errores de tipo (ej. 0.2).
      const durationInt = Math.max(1, Math.round(Number(duration)));

      const logData: any = {
        user_id: userId,
        duration_minutes: durationInt,
        description: description,
        practice_date: new Date().toISOString().split('T')[0],
      };

      // Agregar datos de respiración si están disponibles
      if (breathingData) {
        logData.breathing_cycles = breathingData.cycles;
        logData.breathing_avg_stability = breathingData.avgStability;
        logData.breathing_peak_stability = breathingData.peakStability;
        logData.breathing_max_rms = breathingData.maxRMS;
      }

      const { data, error } = await supabase
        .from("practice_logs")
        .insert(logData)
        .select()
        .single();
        
      if (error) {
        // Supabase Error al crear log
        return;
      }
      
      set((state) => ({ logs: [data as PracticeLog, ...state.logs] }));
      
    } catch (error) {
      // Excepción al agregar log
    }
  },
  
  deleteLog: async (id: string) => {
    try {
      const { error } = await supabase
        .from("practice_logs")
        .delete()
        .eq("id", id); 

      if (error) {
        // Supabase Error al eliminar log
        return;
      }
      
      set((state) => ({ 
        logs: state.logs.filter((log) => log.id !== id) 
      }));
      
    } catch (error) {
      // Excepción al eliminar log
    }
  },
});

export const usePracticeStore = create<PracticeStore>(storeCreator);