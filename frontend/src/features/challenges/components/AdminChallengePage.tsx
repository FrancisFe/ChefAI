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
  const [createdChallenge, setCreatedChallenge] = useState<ChallengeResult | null>(null);

  const { data: ingredients } = useQuery<Ingredient[]>({
    queryKey: ["challenge", "ingredients"],
    queryFn: async () => {
      const res = await apiClient.get<Ingredient[]>("/challenge/ingredients");
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
    onSuccess: (data) => {
      toast.success("Desafío creado");
      setCreatedChallenge(data);
    },
    onError: () => toast.error("Error al crear el desafío"),
  });

  const activateMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      await apiClient.post(`/challenge/${challengeId}/activate`);
    },
    onSuccess: () => {
      toast.success("Desafío activado");
      setCreatedChallenge(null);
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

  return (
    <div style={{ maxWidth: "600px" }}>
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

      {createdChallenge && (
        <div
          style={{
            marginTop: "24px",
            padding: "20px",
            border: "2px solid #4caf50",
            borderRadius: "8px",
            background: "#f1f8e9",
          }}
        >
          <h3>Desafío creado</h3>
          <p>
            <strong>Ingrediente:</strong> {createdChallenge.starIngredientName}
          </p>
          <p>
            <strong>Inicio:</strong> {new Date(createdChallenge.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Cierre:</strong> {new Date(createdChallenge.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Estado:</strong> {createdChallenge.status}
          </p>
          <button
            onClick={() => activateMutation.mutate(createdChallenge.id)}
            disabled={activateMutation.isPending}
            style={{
              marginTop: "12px",
              padding: "10px 24px",
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
      )}
    </div>
  );
}
