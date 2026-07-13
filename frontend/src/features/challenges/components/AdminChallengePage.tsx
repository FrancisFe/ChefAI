import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api-client";
import { toast } from "sonner";

interface Ingredient {
  id: number;
  name: string;
}

interface ChallengeResult {
  id: number;
  starIngredientId: number;
  starIngredientName: string;
  startDate: string;
  endDate: string;
  status: string;
}

export default function AdminChallengePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ingredientId, setIngredientId] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: ingredients } = useQuery<Ingredient[]>({
    queryKey: ["challenge", "ingredients"],
    queryFn: async () => {
      const res = await apiClient.get<Ingredient[]>("/challenge/ingredients");
      return res.data;
    },
  });

  const { data: challenges } = useQuery<ChallengeResult[]>({
    queryKey: ["challenge", "all"],
    queryFn: async () => {
      const res = await apiClient.get<ChallengeResult[]>("/challenge");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post<ChallengeResult>("/challenge", {
        starIngredientId: ingredientId,
        startDate,
        endDate,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Desafío creado");
      setIngredientId(0);
      setStartDate("");
      setEndDate("");
      queryClient.invalidateQueries({ queryKey: ["challenge", "all"] });
    },
    onError: () => toast.error("Error al crear el desafío"),
  });

  const activateMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await apiClient.post(`/challenge/${challengeId}/activate`);
    },
    onSuccess: () => {
      toast.success("Desafío activado");
      queryClient.invalidateQueries({ queryKey: ["challenge", "all"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", "active"] });
    },
    onError: () => toast.error("Error al activar el desafío"),
  });

  const cancelMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await apiClient.post(`/challenge/${challengeId}/cancel`);
    },
    onSuccess: () => {
      toast.success("Desafío cancelado");
      queryClient.invalidateQueries({ queryKey: ["challenge", "all"] });
      queryClient.invalidateQueries({ queryKey: ["challenge", "active"] });
    },
    onError: () => toast.error("Error al cancelar el desafío"),
  });

  const handleCreate = () => {
    if (!ingredientId || !startDate || !endDate) return;
    createMutation.mutate();
  };

  const now = new Date().toLocaleString("sv-SE").slice(0, 16);

  const sectionConfig: { key: string; title: string; border: string; bg: string }[] = [
    { key: "Draft", title: "Borradores", border: "#ffa726", bg: "#fff8e1" },
    { key: "Active", title: "Activos", border: "#4caf50", bg: "#f1f8e9" },
    { key: "Completed", title: "Completados", border: "#bbb", bg: "#f5f5f5" },
    { key: "Cancelled", title: "Cancelados", border: "#e53935", bg: "#ffebee" },
  ];

  return (
    <div style={{ maxWidth: "800px" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "16px", cursor: "pointer" }}>
        ← Volver
      </button>
      <h1>Administrar desafíos</h1>

      <div style={{ padding: "24px", border: "1px solid #ddd", borderRadius: "8px", marginTop: "16px" }}>
        <h2>Crear nuevo desafío</h2>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
            Ingrediente estrella
          </label>
          <select
            value={ingredientId}
            onChange={(e) => setIngredientId(Number(e.target.value))}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value={0}>Seleccionar ingrediente...</option>
            {ingredients?.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
            Fecha de inicio
          </label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={now}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
            Fecha de cierre
          </label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={now}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!ingredientId || !startDate || !endDate || createMutation.isPending}
          style={{
            padding: "10px 24px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {createMutation.isPending ? "Creando..." : "Crear desafío"}
        </button>
      </div>

      {sectionConfig.map((section) => {
        const items = challenges?.filter((c) => c.status === section.key) ?? [];
        if (items.length === 0) return null;

        return (
          <div key={section.key} style={{ marginTop: "32px" }}>
            <h2>{section.title} ({items.length})</h2>
            {items.map((c) => (
              <div
                key={c.id}
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  border: `1px solid ${section.border}`,
                  borderRadius: "8px",
                  background: section.bg,
                  color: section.key === "Completed" || section.key === "Cancelled" ? "#666" : "inherit",
                }}
              >
                <p><strong>Ingrediente:</strong> {c.starIngredientName}</p>
                <p><strong>Estado:</strong> {c.status}</p>
                <p><strong>Inicio:</strong> {new Date(c.startDate).toLocaleDateString()}</p>
                <p><strong>Cierre:</strong> {new Date(c.endDate).toLocaleDateString()}</p>
                {c.status === "Draft" && (
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button
                      onClick={() => activateMutation.mutate(c.id)}
                      disabled={activateMutation.isPending}
                      style={{
                        padding: "8px 20px",
                        background: "#4caf50",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {activateMutation.isPending ? "Activando..." : "Activar desafío"}
                    </button>
                    <button
                      onClick={() => cancelMutation.mutate(c.id)}
                      disabled={cancelMutation.isPending}
                      style={{
                        padding: "8px 20px",
                        background: "#e53935",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {cancelMutation.isPending ? "Cancelando..." : "Cancelar"}
                    </button>
                  </div>
                )}
                {c.status === "Active" && (
                  <button
                    onClick={() => cancelMutation.mutate(c.id)}
                    disabled={cancelMutation.isPending}
                    style={{
                      marginTop: "8px",
                      padding: "8px 20px",
                      background: "#e53935",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {cancelMutation.isPending ? "Cancelando..." : "Cancelar desafío"}
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}

      {challenges && challenges.length === 0 && (
        <p style={{ marginTop: "24px", color: "#666" }}>No hay desafíos todavía.</p>
      )}
    </div>
  );
}
