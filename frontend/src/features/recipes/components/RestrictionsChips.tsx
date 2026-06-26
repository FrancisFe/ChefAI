import { useProfile } from "../../auth/hooks/useProfile";

interface RestrictionsChipsProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function RestrictionsChips({ className, style }: RestrictionsChipsProps) {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile || profile.dietaryRestrictions.length === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        marginTop: "16px",
        ...style,
      }}
    >
      {profile.dietaryRestrictions.map((restriction) => (
        <div
          key={restriction.name}
          style={{
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            padding: "6px 12px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#1976d2" }} />
          {restriction.name}
        </div>
      ))}
    </div>
  );
}
