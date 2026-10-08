import AuthImage from "./AuthImage";
import { fullName, initials } from "../lib/format";

export default function Avatar({ profile, size = 36, className = "" }) {
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size / 2.6)) };
  const name = fullName(profile);

  return (
    <span className={`avatar ${className}`} style={style} title={name}>
      <AuthImage
        attachmentId={profile?.avatarId}
        alt={name}
        className="avatar-img"
        fallback={<span className="avatar-initials">{initials(profile)}</span>}
      />
    </span>
  );
}
