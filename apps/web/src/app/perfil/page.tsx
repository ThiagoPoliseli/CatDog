"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import {
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
  UserCircle,
  ZoomIn,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── helpers ──────────────────────────────────────────────────────────────────

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const SIZE = 512;
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    SIZE,
    SIZE,
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas vazio"))),
      "image/jpeg",
      0.92,
    );
  });
}

// ── tipos ────────────────────────────────────────────────────────────────────

type UserProfile = { email: string; name: string; createdAt: string; avatarUrl?: string };
type StatusMsg = { type: "success" | "error"; message: string };

// ── componente ───────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // crop modal
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<StatusMsg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // info pessoal
  const [name, setName] = useState("");
  const [profileStatus, setProfileStatus] = useState<StatusMsg | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<StatusMsg | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (!user) return;
        setProfile({
          email: user.email ?? "",
          name: (user.user_metadata?.name as string) ?? "",
          createdAt: user.created_at,
          avatarUrl: (user.user_metadata?.avatar_url as string) ?? undefined,
        });
        setName((user.user_metadata?.name as string) ?? "");
        setLoading(false);
      });
  }, []);

  // abre o file picker
  function openFilePicker() {
    fileInputRef.current?.click();
  }

  // arquivo selecionado → abre modal de crop
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRawImageSrc(reader.result);
      }
    });
    reader.readAsDataURL(file);
    // limpa o input para permitir re-seleção do mesmo arquivo
    e.target.value = "";
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // confirma crop → upload
  async function handleConfirmCrop() {
    if (!rawImageSrc || !croppedAreaPixels) return;

    setUploadingAvatar(true);
    setAvatarStatus(null);

    try {
      const blob = await getCroppedBlob(rawImageSrc, croppedAreaPixels);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Nao autenticado");

      const path = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      const urlWithBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlWithBust },
      });
      if (updateError) throw updateError;

      setProfile((prev) => (prev ? { ...prev, avatarUrl: urlWithBust } : prev));
      setRawImageSrc(null);
      setAvatarStatus({ type: "success", message: "Foto atualizada!" });
      setTimeout(() => setAvatarStatus(null), 3000);
    } catch (err) {
      setAvatarStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao fazer upload.",
      });
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileStatus(null);
    setProfileSaved(false);
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setProfileStatus({ type: "error", message: "O nome deve ter pelo menos 2 caracteres." });
      return;
    }
    setSavingProfile(true);
    const { error } = await createClient().auth.updateUser({ data: { name: trimmed } });
    setSavingProfile(false);
    if (error) { setProfileStatus({ type: "error", message: error.message }); return; }
    setProfile((prev) => (prev ? { ...prev, name: trimmed } : prev));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordSaved(false);
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");
    if (password.length < 6) {
      setPasswordStatus({ type: "error", message: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "As senhas nao coincidem." });
      return;
    }
    setSavingPassword(true);
    const { error } = await createClient().auth.updateUser({ password });
    setSavingPassword(false);
    if (error) { setPasswordStatus({ type: "error", message: error.message }); return; }
    passwordFormRef.current?.reset();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 2500);
  }

  const initials = profile?.name
    ? profile.name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : (profile?.email?.[0]?.toUpperCase() ?? "?");

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "";

  if (loading) {
    return (
      <main className="page">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="page">

      {/* ── file input oculto ─────────────────────────────────── */}
      <input
        ref={fileInputRef}
        accept="image/*"
        className="sr-only"
        type="file"
        onChange={handleFileChange}
      />

      {/* ── Modal de crop ─────────────────────────────────────── */}
      <Dialog open={!!rawImageSrc} onOpenChange={(open) => { if (!open) setRawImageSrc(null); }}>
        <DialogContent className="max-w-md p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>Ajustar foto de perfil</DialogTitle>
            <DialogDescription>
              Arraste para reposicionar e use o zoom para enquadrar.
            </DialogDescription>
          </DialogHeader>

          {/* area do cropper */}
          <div className="relative h-72 w-full bg-black">
            {rawImageSrc && (
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          {/* zoom slider */}
          <div className="flex items-center gap-3 px-6 py-4">
            <ZoomIn size={16} className="shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
            />
            <span className="w-8 shrink-0 text-right text-xs text-muted-foreground">
              {zoom.toFixed(1)}×
            </span>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setRawImageSrc(null)}
              disabled={uploadingAvatar}
            >
              Cancelar
            </Button>
            <Button
              className="gap-2"
              onClick={handleConfirmCrop}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <><Loader2 size={15} className="animate-spin" /> Salvando...</>
              ) : (
                <><CheckCircle2 size={15} /> Confirmar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <Card className="mb-6 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary via-primary/60 to-accent/40" />
        <div className="px-6 pb-6">
          <div className="-mt-10 mb-4 flex items-end gap-4">
            {/* avatar */}
            <button
              type="button"
              onClick={openFilePicker}
              className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-4 ring-card focus:outline-none focus-visible:ring-primary"
            >
              {profile?.avatarUrl ? (
                <img
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                  src={profile.avatarUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-accent text-2xl font-extrabold text-white">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera size={18} className="text-white" />
                <span className="text-[10px] font-medium text-white">Trocar</span>
              </div>
            </button>

          </div>

          {avatarStatus && (
            <Alert
              variant={avatarStatus.type === "error" ? "destructive" : "success"}
              className="mb-3 py-2"
            >
              <AlertDescription className="text-xs">{avatarStatus.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{profile?.name || "Sem nome"}</h1>
            <Badge variant="species">Usuario</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{profile?.email}</p>
          {memberSince && (
            <p className="text-xs text-muted-foreground">Membro desde {memberSince}</p>
          )}
        </div>
      </Card>

      {/* ── Formularios ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Informacoes pessoais */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserCircle size={18} className="text-primary" />
              Informacoes pessoais
            </CardTitle>
            <CardDescription>Atualize seu nome de exibicao na plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {profileStatus && (
              <Alert variant={profileStatus.type === "error" ? "destructive" : "success"} className="mb-4">
                <AlertDescription>{profileStatus.message}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSaveProfile} className="flex flex-1 flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User aria-hidden size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
                  <Input id="name" className="pl-9" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" placeholder="Seu nome completo" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail aria-hidden size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
                  <Input id="email" className="cursor-not-allowed pl-9 opacity-60" value={profile?.email ?? ""} readOnly disabled type="email" />
                </div>
                <p className="text-xs text-muted-foreground">O e-mail nao pode ser alterado por aqui.</p>
              </div>
              <Button type="submit" className="mt-auto w-full gap-2" disabled={savingProfile || profileSaved}>
                {profileSaved ? <><CheckCircle2 size={16} /> Salvo!</> : savingProfile ? "Salvando..." : "Salvar alteracoes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Alterar senha */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound size={18} className="text-primary" />
              Alterar senha
            </CardTitle>
            <CardDescription>Defina uma nova senha segura para sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {passwordStatus && (
              <Alert variant={passwordStatus.type === "error" ? "destructive" : "success"} className="mb-4">
                <AlertDescription>{passwordStatus.message}</AlertDescription>
              </Alert>
            )}
            <form ref={passwordFormRef} onSubmit={handleChangePassword} className="flex flex-1 flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="password">Nova senha</Label>
                <div className="relative">
                  <Lock aria-hidden size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
                  <Input id="password" className="px-9" name="password" required minLength={6} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Minimo 6 caracteres" />
                  <Button aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute right-1 top-1" size="icon" type="button" variant="ghost" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </Button>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <div className="relative">
                  <Lock aria-hidden size={16} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
                  <Input id="confirmPassword" className="px-9" name="confirmPassword" required minLength={6} type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repita a nova senha" />
                  <Button aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"} className="absolute right-1 top-1" size="icon" type="button" variant="ghost" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="mt-auto w-full gap-2" disabled={savingPassword || passwordSaved}>
                {passwordSaved ? <><CheckCircle2 size={16} /> Senha alterada!</> : savingPassword ? "Alterando..." : "Alterar senha"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </main>
  );
}
