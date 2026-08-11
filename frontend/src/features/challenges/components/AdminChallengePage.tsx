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

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  boxShadow: "var(--shadow)",
  padding: "24px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "14px",
  fontWeight: 600,
  color: "var(--text-h)",
  marginBottom: "6px",
};

const baseInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "15px",
  backgroundColor: "var(--bg)",
  color: "var(--text-h)",
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 0.2s",
};

const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--text)",
  cursor: "pointer",
  fontSize: "15px",
  padding: "0",
  marginBottom: "16px",
  transition: "color 0.2s",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 24px",
  backgroundColor: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  transition: "opacity 0.2s, box-shadow 0.2s",
};

type FieldName = "ingredient" | "startDate" | "endDate";

export default function AdminChallengePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [ingredientId, setIngredientId] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [focusedField, setFocusedField] = useState<FieldName | null>(null);

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

  const sectionConfig: { key: string; title: string; color: string }[] = [
    { key: "Draft", title: "Borradores", color: "#ffa726" },
    { key: "Active", title: "Activos", color: "#4caf50" },
    { key: "Completed", title: "Completados", color: "#9e9e9e" },
    { key: "Cancelled", title: "Cancelados", color: "#e53935" },
  ];

  const fieldStyle = (field: FieldName): React.CSSProperties => ({
    ...baseInputStyle,
    borderColor: focusedField === field ? "var(--accent-border)" : undefined,
  });

  return (
    <div style={{ maxWidth: "800px" }}>
      <button
        onClick={() => navigate(-1)}
        style={backButtonStyle}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text)")}
      >
        ← Volver
      </button>
      <h1>Administrar desafíos</h1>

      <div style={{ ...cardStyle, marginTop: "16px" }}>
        <h2 style={{ fontSize: "18px", margin: "0 0 16px" }}>Crear nuevo desafío</h2>

        <div style={{ marginBottom: "12px" }}>
          <label htmlFor="ingredient" style={labelStyle}>
            Ingrediente estrella
          </label>
          <select
            id="ingredient"
            value={ingredientId}
            onChange={(e) => setIngredientId(Number(e.target.value))}
            onFocus={() => setFocusedField("ingredient")}
            onBlur={() => setFocusedField(null)}
            style={fieldStyle("ingredient")}
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
          <label htmlFor="startDate" style={labelStyle}>
            Fecha de inicio
          </label>
          <input
            id="startDate"
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={now}
            onFocus={() => setFocusedField("startDate")}
            onBlur={() => setFocusedField(null)}
            style={fieldStyle("startDate")}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="endDate" style={labelStyle}>
            Fecha de cierre
          </label>
          <input
            id="endDate"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={now}
            onFocus={() => setFocusedField("endDate")}
            onBlur={() => setFocusedField(null)}
            style={fieldStyle("endDate")}
          />
        </div>

        <button
          onClick={handleCreate}
          disabled={!ingredientId || !startDate || !endDate || createMutation.isPending}
          style={{
            ...primaryButtonStyle,
            opacity:
              !ingredientId || !startDate || !endDate || createMutation.isPending
                ? 0.6
                : 1,
            cursor:
              !ingredientId || !startDate || !endDate || createMutation.isPending
                ? "not-allowed"
                : "pointer",
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
                  border: `1px solid ${section.color}`,
                  borderRadius: "8px",
                  background: `${section.color}14`,
                  color: "var(--text)",
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
                        borderRadius: "8px",
                        cursor: activateMutation.isPending ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        opacity: activateMutation.isPending ? 0.6 : 1,
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
                        borderRadius: "8px",
                        cursor: cancelMutation.isPending ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        opacity: cancelMutation.isPending ? 0.6 : 1,
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
                      borderRadius: "8px",
                      cursor: cancelMutation.isPending ? "not-allowed" : "pointer",
                      fontWeight: 600,
                      opacity: cancelMutation.isPending ? 0.6 : 1,
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
        <p style={{ marginTop: "24px", color: "var(--text)" }}>No hay desafíos todavía.</p>
      )}
    </div>
  );
}
