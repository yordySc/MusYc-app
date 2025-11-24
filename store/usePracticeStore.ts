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
}

type PracticeStore = {
  logs: PracticeLog[];
  isLogsLoading: boolean;
  
  loadLogs: (userId: string) => Promise<void>;
  addLog: (userId: string, duration: number, description: string) => Promise<void>;
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
        console.error("Supabase Error al cargar logs: ", error);
      }
      set({ logs: data as PracticeLog[] ?? [] });
    } catch (error) {
      console.error("Excepción al cargar logs:", error);
    } finally {
      set({ isLogsLoading: false });
    }
  },

  addLog: async (userId: string, duration: number, description: string) => {
    if (!userId) {
      console.error("Usuario no autenticado para agregar log.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("practice_logs")
        .insert({
            user_id: userId,
            duration_minutes: duration,
            description: description,
            practice_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();
        
      if (error) {
        console.error("Supabase Error al crear log:", error);
        return;
      }
      
      set((state) => ({ logs: [data as PracticeLog, ...state.logs] }));
      
    } catch (error) {
      console.error("Excepción al agregar log", error);
    }
  },
  
  deleteLog: async (id: string) => {
    try {
      const { error } = await supabase
        .from("practice_logs")
        .delete()
        .eq("id", id); 

      if (error) {
        console.error("Supabase Error al eliminar log:", error);
        return;
      }
      
      set((state) => ({ 
        logs: state.logs.filter((log) => log.id !== id) 
      }));
      
    } catch (error) {
      console.error("Excepción al eliminar log:", error);
    }
  },
});

export const usePracticeStore = create<PracticeStore>(storeCreator);