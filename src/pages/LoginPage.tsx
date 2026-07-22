// 사서 로그인/회원가입/아이디·비밀번호 찾기를 처리하는 로그인 화면
import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import {
  BookOpen, User as UserIcon, Lock, Mail, Hash, Eye, EyeOff,
  AlertCircle, CheckCircle2, X, KeyRound, Search, ArrowRight, Stamp,
  type LucideIcon,
} from "lucide-react";
import { withAlpha } from "../components";
import { login, registerUser, findUserId, resetPassword } from "../data/auth";
import { Session, User } from "../types";

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  Slate ink + warm ochre, quieter than the previous green/brass       */
/*  take. Move these into ../constants/colors.ts if you want them      */
/*  reused elsewhere; kept local here so this file stays drop-in.      */
/* ------------------------------------------------------------------ */
const PRIMARY = "#232A35";       // slate ink
const PRIMARY_DARK = "#171B22";
const ACCENT = "#C68A3D";        // warm ochre
const PAPER = "#FAF7F0";         // page / card background
const PAPER_DIM = "#E9E2D1";     // hairlines
const INK = "#201C16";           // body text
const MUTED = "#8B8579";         // secondary text
const STAMP = "#B23A2E";         // idle-book status + errors
const MOSS = "#4C7A5E";          // active-book status + success

const SERIF = "'Fraunces', 'Noto Serif KR', serif";
const SANS = "'IBM Plex Sans', 'IBM Plex Sans KR', sans-serif";
const MONO = "'JetBrains Mono', monospace";

function useLibraryFonts() {
  useEffect(() => {
    const id = "library-login-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export function LoginPage({ onLogin }: { onLogin: (session: Session) => void }) {
  useLibraryFonts();

  const [signupOpen, setSignupOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);

  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [notice, setNotice] = useState("");
  const [stamping, setStamping] = useState(false);

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    if (!loginId.trim() || !loginPw) {
      setLoginError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    const result = login(loginId.trim(), loginPw);
    if (!result.ok) {
      setLoginError(result.message);
      return;
    }
    setStamping(true);
    // 개선: login()이 이제 비밀번호 없는 session을 바로 반환하므로, 여기서 다시 비밀번호를
    // 제거하는 구조분해를 반복할 필요가 없어짐
    setTimeout(() => onLogin(result.session), 380);
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{
        fontFamily: SANS,
        background: `
          radial-gradient(560px 360px at 12% -8%, ${withAlpha(ACCENT, 0.08)}, transparent 60%),
          radial-gradient(560px 360px at 100% 100%, ${withAlpha(PRIMARY, 0.06)}, transparent 60%),
          ${PAPER}`,
      }}
    >
      <style>{`
        @keyframes riseIn { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:translateY(0);} }
        @keyframes stampDown { 0% { transform: scale(1); } 45% { transform: scale(0.94); } 100% { transform: scale(1); } }
        .rise { animation: riseIn .5s cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      {/* Outer frame — becomes a single standalone card once the catalog panel is hidden below md */}
      <div className="w-full max-w-sm md:max-w-3xl rise flex rounded-2xl overflow-hidden"
        style={{ backgroundColor: PAPER, boxShadow: `0 24px 48px -24px ${withAlpha(PRIMARY_DARK, 0.33)}, 0 1px 0 ${PAPER_DIM}` }}>

        {/* ---------------- Catalog panel — desktop only ---------------- */}
        <div
          className="hidden md:flex md:w-[38%] relative flex-col justify-between px-8 py-9 overflow-hidden"
          style={{ backgroundColor: PRIMARY, color: PAPER }}
        >
          <div className="absolute -top-24 -left-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${withAlpha(ACCENT, 0.2)}, transparent 70%)` }} />

          <div className="relative">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: ACCENT }}>
                <BookOpen className="w-4 h-4" style={{ color: PRIMARY_DARK }} />
              </div>
              <span style={{ fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.12em", color: withAlpha(PAPER, 0.7) }}>
                SUWON LIBRARY NETWORK
              </span>
            </div>

            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-5"
              style={{ border: `1px solid ${withAlpha(ACCENT, 0.33)}`, color: ACCENT, fontFamily: MONO, fontSize: "10.5px", letterSpacing: "0.06em" }}
            >
              <Stamp className="w-3 h-3" /> 청구기호 025.2
            </span>

            <h1 style={{ fontFamily: SERIF, fontSize: "25px", fontWeight: 600, lineHeight: 1.4, marginBottom: "10px" }}>
              도서 관리 시스템
            </h1>
            <p style={{ fontSize: "13px", lineHeight: 1.75, color: withAlpha(PAPER, 0.72), maxWidth: "260px" }}>
              유휴 도서를 자동으로 판별하고, 서가 재배치와 이전 작업을 관리합니다.
            </p>
          </div>

          <div className="relative">
            <div className="h-px w-full mb-4" style={{ backgroundColor: withAlpha(PAPER, 0.12) }} />
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: MOSS }} />
                <span style={{ fontSize: "12px", color: withAlpha(PAPER, 0.85) }}>활성 도서 — 정상 대출 순환 중</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STAMP }} />
                <span style={{ fontSize: "12px", color: withAlpha(PAPER, 0.85) }}>유휴 도서 — 1년 이상 미대출, 이전 대상</span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- Login form — always visible ---------------- */}
        <div className="w-full md:w-[62%] px-6 py-8 sm:px-9 sm:py-10 flex flex-col justify-center">
          {/* compact identity, shown only when catalog panel is hidden (mobile) */}
          <div className="flex md:hidden items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: PRIMARY }}>
              <BookOpen className="w-4 h-4" style={{ color: ACCENT }} />
            </div>
            <div>
              <p style={{ fontFamily: SERIF, fontSize: "15px", fontWeight: 600, color: INK, lineHeight: 1.2 }}>도서 관리 시스템</p>
              <p style={{ fontSize: "11px", color: MUTED }}>수원시 공공도서관 · 사서 전용</p>
            </div>
          </div>

          <h2 style={{ fontFamily: SERIF, fontSize: "20px", fontWeight: 600, color: INK }}>로그인</h2>
          <p className="mb-6 mt-1.5" style={{ fontSize: "13px", color: MUTED }}>사서 계정으로 로그인해 주세요</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            {notice && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: withAlpha(MOSS, 0.08), color: MOSS }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {notice}
              </div>
            )}
            <Field icon={UserIcon} placeholder="아이디" value={loginId} onChange={setLoginId} autoComplete="username" />
            <Field
              icon={Lock}
              placeholder="비밀번호"
              type={showPw ? "text" : "password"}
              value={loginPw}
              onChange={setLoginPw}
              autoComplete="current-password"
              trailing={
                <button type="button" onClick={() => setShowPw((s) => !s)} style={{ color: MUTED }} className="flex-shrink-0">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            {loginError && (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: STAMP }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {loginError}
              </div>
            )}

            <button
              type="submit"
              className="mt-1.5 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-95 active:scale-[0.99]"
              style={{
                backgroundColor: PRIMARY,
                color: PAPER,
                boxShadow: `0 10px 20px -10px ${withAlpha(PRIMARY, 0.6)}`,
                animation: stamping ? "stampDown .38s ease-out" : "none",
              }}
            >
              로그인 <ArrowRight className="w-4 h-4" />
            </button>

            {/* 주의: 테스트 계정 정보를 로그인 화면에 그대로 노출하고 있음 — 실서비스 배포 전 반드시 제거할 것 */}
            <p className="text-center mt-1" style={{ fontSize: "12px", color: MUTED }}>
              테스트 계정 — 아이디 <span style={{ fontFamily: MONO, color: INK, fontWeight: 500 }}>admin</span>
              {" "}· 비밀번호 <span style={{ fontFamily: MONO, color: INK, fontWeight: 500 }}>admin</span>
            </p>
          </form>

          <div className="w-full mt-6 flex items-center justify-center gap-3">
            <button onClick={() => setSignupOpen(true)} className="text-sm font-medium transition-colors" style={{ color: MUTED }}>
              회원가입
            </button>
            <span className="w-px h-3.5" style={{ backgroundColor: PAPER_DIM }} />
            <button onClick={() => setFindOpen(true)} className="text-sm font-medium transition-colors" style={{ color: MUTED }}>
              아이디 / 비밀번호 찾기
            </button>
          </div>

          <p className="text-center mt-7" style={{ fontSize: "11.5px", color: MUTED }}>© 2026 수원시 공공도서관 관리 시스템</p>
        </div>
      </div>

      {signupOpen && (
        <SignupModal
          onClose={() => setSignupOpen(false)}
          onSuccess={(id) => {
            setSignupOpen(false);
            setLoginId(id);
            setNotice("회원가입이 완료되었습니다. 로그인해 주세요.");
          }}
        />
      )}
      {findOpen && <FindAccountModal onClose={() => setFindOpen(false)} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal shell                                                       */
/* ------------------------------------------------------------------ */
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  // 개선: Esc 키 닫기 + 접근성 속성(role/aria) 추가 (다른 모달들과 일관성 맞춤)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: SANS }}>
      <div className="absolute inset-0" style={{ backgroundColor: withAlpha(PRIMARY_DARK, 0.4), backdropFilter: "blur(2px)" }} onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="login-modal-title"
        className="relative rounded-2xl w-full max-w-sm overflow-hidden rise" style={{ backgroundColor: PAPER, boxShadow: `0 24px 48px -20px ${withAlpha(PRIMARY_DARK, 0.4)}` }}>
        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})` }} />
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${PAPER_DIM}` }}>
          <h3 id="login-modal-title" style={{ fontFamily: SERIF, fontSize: "16px", fontWeight: 600, color: INK }}>{title}</h3>
          <button onClick={onClose} aria-label="닫기" className="p-1.5 rounded transition-colors" style={{ color: MUTED }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SignupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) {
  const [suId, setSuId] = useState("");
  const [suPw, setSuPw] = useState("");
  const [suPw2, setSuPw2] = useState("");
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suLibId, setSuLibId] = useState("");
  const [suError, setSuError] = useState("");

  function handleSignup(e: FormEvent) {
    e.preventDefault();
    setSuError("");
    if (!suId.trim() || !suPw || !suPw2 || !suName.trim() || !suEmail.trim() || !suLibId.trim()) {
      setSuError("이름, 이메일, 사서번호를 포함한 모든 항목은 필수입니다."); return;
    }
    if (suPw !== suPw2) { setSuError("비밀번호가 일치하지 않습니다."); return; }
    if (suPw.length < 4) { setSuError("비밀번호는 4자 이상이어야 합니다."); return; }
    if (!/^\S+@\S+\.\S+$/.test(suEmail.trim())) { setSuError("이메일 형식이 올바르지 않습니다."); return; }

    const newUser: User = {
      id: suId.trim(), password: suPw, name: suName.trim(),
      email: suEmail.trim(), librarianId: suLibId.trim(),
    };
    const result = registerUser(newUser);
    if (!result.ok) { setSuError(result.message); return; }
    onSuccess(newUser.id);
  }

  return (
    <ModalShell title="회원가입" onClose={onClose}>
      <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
        <Field icon={UserIcon} placeholder="아이디" value={suId} onChange={setSuId} autoComplete="username" />
        <Field icon={Lock} placeholder="비밀번호" type="password" value={suPw} onChange={setSuPw} autoComplete="new-password" />
        <Field icon={Lock} placeholder="비밀번호 확인" type="password" value={suPw2} onChange={setSuPw2} autoComplete="new-password" />
        <div className="h-px my-0.5" style={{ backgroundColor: PAPER_DIM }} />
        <Field icon={UserIcon} placeholder="이름 (필수)" value={suName} onChange={setSuName} />
        <Field icon={Mail} placeholder="이메일 (필수)" type="email" value={suEmail} onChange={setSuEmail} autoComplete="email" />
        <Field icon={Hash} placeholder="사서번호 (필수)" value={suLibId} onChange={setSuLibId} />
        {suError && (
          <div className="flex items-center gap-2 text-sm font-medium" style={{ color: STAMP }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {suError}
          </div>
        )}
        <button type="submit" className="mt-1 py-3 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90" style={{ backgroundColor: PRIMARY, color: PAPER }}>
          가입하기
        </button>
        <p className="text-center mt-1" style={{ fontSize: "12.5px", color: MUTED }}>이름 · 이메일 · 사서번호는 필수 입력 항목입니다.</p>
      </form>
    </ModalShell>
  );
}

function FindAccountModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"id" | "pw">("id");

  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [idResult, setIdResult] = useState<{ ok: true; id: string } | { ok: false; message: string } | null>(null);

  const [pId, setPId] = useState("");
  const [pName, setPName] = useState("");
  const [pEmail, setPEmail] = useState("");
  const [pNewPw, setPNewPw] = useState("");
  const [pNewPw2, setPNewPw2] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleFindId(e: FormEvent) {
    e.preventDefault();
    if (!fName.trim() || !fEmail.trim()) { setIdResult({ ok: false, message: "이름과 이메일을 모두 입력해 주세요." }); return; }
    setIdResult(findUserId(fName, fEmail));
  }

  function handleResetPw(e: FormEvent) {
    e.preventDefault();
    if (!pId.trim() || !pName.trim() || !pEmail.trim() || !pNewPw || !pNewPw2) {
      setPwMsg({ ok: false, text: "모든 항목을 입력해 주세요." }); return;
    }
    if (pNewPw !== pNewPw2) { setPwMsg({ ok: false, text: "새 비밀번호가 일치하지 않습니다." }); return; }
    if (pNewPw.length < 4) { setPwMsg({ ok: false, text: "비밀번호는 4자 이상이어야 합니다." }); return; }
    const result = resetPassword(pId, pName, pEmail, pNewPw);
    if (!result.ok) { setPwMsg({ ok: false, text: result.message }); return; }
    setPwMsg({ ok: true, text: "비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해 주세요." });
  }

  return (
    <ModalShell title="아이디 / 비밀번호 찾기" onClose={onClose}>
      <div className="grid grid-cols-2 rounded-lg overflow-hidden mb-4" style={{ border: `1px solid ${PAPER_DIM}` }}>
        <button onClick={() => setTab("id")} className="py-2.5 text-sm font-semibold transition-colors"
          style={tab === "id" ? { color: PAPER, backgroundColor: PRIMARY } : { color: MUTED }}>
          아이디 찾기
        </button>
        <button onClick={() => setTab("pw")} className="py-2.5 text-sm font-semibold transition-colors"
          style={tab === "pw" ? { color: PAPER, backgroundColor: PRIMARY } : { color: MUTED }}>
          비밀번호 찾기
        </button>
      </div>

      {tab === "id" ? (
        <form onSubmit={handleFindId} className="flex flex-col gap-3.5">
          <Field icon={UserIcon} placeholder="이름" value={fName} onChange={setFName} />
          <Field icon={Mail} placeholder="이메일" type="email" value={fEmail} onChange={setFEmail} autoComplete="email" />
          <button type="submit" className="mt-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY, color: PAPER }}>
            <Search className="w-4 h-4" /> 아이디 조회
          </button>
          {idResult && (
            idResult.ok ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: withAlpha(MOSS, 0.08), color: MOSS }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                회원님의 아이디는 <span style={{ fontFamily: MONO }}>{idResult.id}</span> 입니다.
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: STAMP }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {idResult.message}
              </div>
            )
          )}
        </form>
      ) : (
        <form onSubmit={handleResetPw} className="flex flex-col gap-3.5">
          <Field icon={UserIcon} placeholder="아이디" value={pId} onChange={setPId} autoComplete="username" />
          <Field icon={UserIcon} placeholder="이름" value={pName} onChange={setPName} />
          <Field icon={Mail} placeholder="이메일" type="email" value={pEmail} onChange={setPEmail} autoComplete="email" />
          <div className="h-px my-0.5" style={{ backgroundColor: PAPER_DIM }} />
          <Field icon={KeyRound} placeholder="새 비밀번호" type="password" value={pNewPw} onChange={setPNewPw} autoComplete="new-password" />
          <Field icon={KeyRound} placeholder="새 비밀번호 확인" type="password" value={pNewPw2} onChange={setPNewPw2} autoComplete="new-password" />
          <button type="submit" className="mt-1 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: PRIMARY, color: PAPER }}>
            비밀번호 재설정
          </button>
          {pwMsg && (
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: pwMsg.ok ? MOSS : STAMP }}>
              {pwMsg.ok ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {pwMsg.text}
            </div>
          )}
        </form>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Field                                                              */
/* ------------------------------------------------------------------ */
function Field({ icon: Icon, placeholder, type = "text", value, onChange, trailing, autoComplete }: {
  icon: LucideIcon; placeholder: string; type?: string; value: string; onChange: (v: string) => void; trailing?: ReactNode; autoComplete?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg transition-colors"
      style={{ border: `1px solid ${PAPER_DIM}`, backgroundColor: "#FFFFFF" }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: MUTED }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="flex-1 min-w-0 text-sm bg-transparent outline-none"
        style={{ color: INK }}
      />
      {trailing}
    </div>
  );
}
