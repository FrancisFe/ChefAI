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
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
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
      queryClient.invalidateQueries({ queryKey: ["challenge"] });
    },
    onError: () => toast.error("Error al activar el desafío"),
  });

  const handleCreate = () => {
    if (!ingredientId || !startDate || !endDate) return;
    createMutation.mutate();
  };

  const clearDate = (d: string) => {
    const dt = new Date(d);
    return dt.toISOString().slice(0, 16);
  };

  const now = new Date().toISOString().slice(0, 16);

  const draftChallenges = challenges?.filter((c) => c.status === "Draft") ?? [];
  const activeChallenges = challenges?.filter((c) => c.status === "Active") ?? [];
  const completedChallenges = challenges?.filter((c) => c.status === "Completed") ?? [];

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
            value={startDate ? clearDate(startDate) : ""}
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
            value={endDate ? clearDate(endDate) : ""}
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

      {draftChallenges.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2>Borradores ({draftChallenges.length})</h2>
          {draftChallenges.map((c) => (
            <div
              key={c.id}
              style={{
                marginTop: "12px",
                padding: "16px",
                border: "1px solid #ffa726",
                borderRadius: "8px",
                background: "#fff8e1",
              }}
            >
              <p><strong>Ingrediente:</strong> {c.starIngredientName}</p>
              <p><strong>Inicio:</strong> {new Date(c.startDate).toLocaleDateString()}</p>
              <p><strong>Cierre:</strong> {new Date(c.endDate).toLocaleDateString()}</p>
              <button
                onClick={() => activateMutation.mutate(c.id)}
                disabled={activateMutation.isPending}
                style={{
                  marginTop: "8px",
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
            </div>
          ))}
        </div>
      )}

      {activeChallenges.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2>Activos ({activeChallenges.length})</h2>
          {activeChallenges.map((c) => (
            <div
              key={c.id}
              style={{
                marginTop: "12px",
                padding: "16px",
                border: "1px solid #4caf50",
                borderRadius: "8px",
                background: "#f1f8e9",
              }}
            >
              <p><strong>Ingrediente:</strong> {c.starIngredientName}</p>
              <p><strong>Inicio:</strong> {new Date(c.startDate).toLocaleDateString()}</p>
              <p><strong>Cierre:</strong> {new Date(c.endDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {completedChallenges.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <h2>Completados ({completedChallenges.length})</h2>
          {completedChallenges.map((c) => (
            <div
              key={c.id}
              style={{
                marginTop: "12px",
                padding: "16px",
                border: "1px solid #bbb",
                borderRadius: "8px",
                background: "#f5f5f5",
                color: "#666",
              }}
            >
              <p><strong>Ingrediente:</strong> {c.starIngredientName}</p>
              <p><strong>Inicio:</strong> {new Date(c.startDate).toLocaleDateString()}</p>
              <p><strong>Cierre:</strong> {new Date(c.endDate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {challenges && challenges.length === 0 && (
        <p style={{ marginTop: "24px", color: "#666" }}>No hay desafíos todavía.</p>
      )}
    </div>
  );
}
