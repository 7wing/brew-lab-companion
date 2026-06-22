import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Shield,
  Bell,
  Sliders,
  Eye,
  AlertTriangle,
  Download,
  Trash2,
  Loader2,
  Check,
  LogOut,
  X,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react";
import { copy } from "@/constants/copy";
import {
  useProfile,
  useUpdateProfile,
} from "@/hooks/useProfile";
import {
  useUserSettings,
  useUpdateSettings,
  useUserPrivacy,
  useUpdatePrivacy,
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/hooks/useSettings";
import { useUpdatePassword } from "@/hooks/useUpdatePassword";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { useExportData } from "@/hooks/useExportData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUpload } from "@/hooks/useUpload";

// ─── Notification Types ─────────────────────────────────────────────────────

const NOTIFICATION_TYPES = [
  { type: "follows", label: "Follows" },
  { type: "likes", label: "Likes" },
  { type: "comments", label: "Comments" },
  { type: "tags", label: "Tags" },
  { type: "challenges", label: "Challenges" },
  { type: "batch_actions", label: "Batch Actions" },
  { type: "recipes", label: "Recipes" },
  { type: "weekly_summary", label: "Weekly Summary" },
] as const;

// ─── Account Section ─────────────────────────────────────────────────────────

interface AccountSectionProps {
  profile: any;
  updateProfile: ReturnType<typeof useUpdateProfile>;
}

function AccountSection({ profile, updateProfile }: AccountSectionProps) {
  const { upload: uploadAvatar, uploading: avatarUploading } = useUpload("avatars");
  const { upload: uploadCover, uploading: coverUploading } = useUpload("covers");

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [brewingSince, setBrewingSince] = useState("");
  const [favouriteStyles, setFavouriteStyles] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setUsername(profile.username ?? "");
      setLocation(profile.location ?? "");
      setBio(profile.bio ?? "");
      setBrewingSince(profile.brewing_since ?? "");
      setFavouriteStyles(profile.favourite_styles ?? "");
    }
  }, [profile]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadAvatar(file, `${profile.id}/avatar.jpg`);
      if (url) {
        await updateProfile.mutateAsync({ avatar_url: url });
        toast.success("Avatar updated");
      }
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
    e.target.value = "";
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadCover(file, `${profile.id}/cover.jpg`);
      if (url) {
        await updateProfile.mutateAsync({ cover_photo_url: url });
        toast.success("Cover photo updated");
      }
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
    e.target.value = "";
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        display_name: displayName || null,
        username: username || null,
        location: location || null,
        bio: bio || null,
        brewing_since: brewingSince || null,
        favourite_styles: favouriteStyles || null,
      });
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Photo uploads */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            {copy.settings.account.avatar}
          </Label>
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-copper/30">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                <User size={28} className="text-copper" />
              </AvatarFallback>
            </Avatar>
            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/30 rounded-full opacity-0 hover:opacity-100 transition-opacity">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarUploading ? (
                <Loader2 size={16} className="text-white animate-spin" />
              ) : (
                <User size={16} className="text-white" />
              )}
            </label>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">
            {copy.settings.account.coverPhoto}
          </Label>
          <div className="relative w-full h-20 rounded-lg overflow-hidden bg-muted border border-border/40">
            {profile?.cover_photo_url ? (
              <img
                src={profile.cover_photo_url}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  {copy.profile.noCoverPhoto}
                </span>
              </div>
            )}
            <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverChange}
              />
              {coverUploading ? (
                <Loader2 size={16} className="text-white animate-spin" />
              ) : (
                <span className="text-xs text-white font-medium">
                  {copy.settings.account.uploadCover}
                </span>
              )}
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs mb-1">{copy.settings.account.displayName}</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={copy.profile.displayNamePlaceholder}
          />
        </div>
        <div>
          <Label className="text-xs mb-1">{copy.settings.account.username}</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@username"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs mb-1">{copy.settings.account.location}</Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={copy.profile.locationPlaceholder}
        />
      </div>

      <div>
        <Label className="text-xs mb-1">{copy.settings.account.bio}</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={copy.profile.bioPlaceholder}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs mb-1">{copy.settings.account.brewingSince}</Label>
          <Input
            value={brewingSince}
            onChange={(e) => setBrewingSince(e.target.value)}
            placeholder="e.g. 2020"
          />
        </div>
        <div>
          <Label className="text-xs mb-1">{copy.settings.account.favouriteStyles}</Label>
          <Input
            value={favouriteStyles}
            onChange={(e) => setFavouriteStyles(e.target.value)}
            placeholder="e.g. IPA, Stout, Sour"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving || updateProfile.isPending}
        className="w-full sm:w-auto"
      >
        {(saving || updateProfile.isPending) && (
          <Loader2 size={16} className="animate-spin mr-2" />
        )}
        {copy.settings.account.saveProfile}
      </Button>
    </div>
  );
}

// ─── Security Section ────────────────────────────────────────────────────────

function SecuritySection() {
  const { user } = useAuth();
  const updatePassword = useUpdatePassword();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handleEmailChange() {
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast.success("Email change request sent. Check your new email for confirmation.");
      setEmailDialogOpen(false);
      setNewEmail("");
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  function handlePasswordChange() {
    updatePassword.mutate(
      { password: newPassword },
      {
        onSuccess: () => {
          setPasswordDialogOpen(false);
          setCurrentPassword("");
          setNewPassword("");
        },
      }
    );
  }

  const mockSessions = [
    { id: "1", device: "Chrome on macOS", location: "Current session", current: true, created_at: new Date().toISOString() },
    { id: "2", device: "Safari on iPhone", location: "New York, US", current: false, created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
    { id: "3", device: "Firefox on Windows", location: "London, UK", current: false, created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  ];

  return (
    <div className="space-y-5">
      {/* Change Email */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.security.changeEmail}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEmailDialogOpen(true)}
        >
          {copy.settings.security.changeEmail}
        </Button>
      </div>

      <Separator />

      {/* Change Password */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.security.changePassword}</p>
          <p className="text-xs text-muted-foreground">Update your password</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPasswordDialogOpen(true)}
        >
          {copy.settings.security.changePassword}
        </Button>
      </div>

      <Separator />

      {/* Connected Accounts */}
      <div>
        <p className="text-sm font-medium mb-3">{copy.settings.security.connectedAccounts}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm">Google</span>
            </div>
            <span className="text-xs text-muted-foreground">{copy.settings.security.connected}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Active Sessions */}
      <div>
        <p className="text-sm font-medium mb-3">{copy.settings.security.activeSessions}</p>
        <div className="space-y-2">
          {mockSessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 border border-border/30"
            >
              <div>
                <p className="text-sm font-medium">{session.device}</p>
                <p className="text-xs text-muted-foreground">
                  {session.location}
                  {session.current && (
                    <span className="ml-2 text-teal">· {copy.settings.security.currentSession}</span>
                  )}
                </p>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => toast.success("Session revoked (mock)")}
                >
                  {copy.settings.security.revoke}
                </Button>
              )}
              {session.current && (
                <span className="text-xs text-teal font-medium px-2 py-1 bg-teal/10 rounded-full">
                  {copy.settings.security.active}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* 2FA */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.security.twoFactor}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.security.twoFactorDesc}</p>
        </div>
        <span className="text-xs text-muted-foreground italic">
          {copy.settings.security.comingSoon}
        </span>
      </div>

      {/* Dialogs */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="font-slab">{copy.settings.security.changeEmail}</DialogTitle>
            <DialogDescription>
              Enter your new email address. A confirmation will be sent to both addresses.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{copy.settings.security.newEmail}</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              {copy.common.cancel}
            </Button>
            <Button onClick={handleEmailChange} disabled={!newEmail}>
              {copy.common.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="font-slab">{copy.settings.security.changePassword}</DialogTitle>
            <DialogDescription>Choose a strong, unique password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{copy.settings.security.currentPassword}</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>{copy.settings.security.newPasswordLabel}</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>
              {copy.common.cancel}
            </Button>
            <Button
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || updatePassword.isPending}
            >
              {updatePassword.isPending && (
                <Loader2 size={16} className="animate-spin mr-2" />
              )}
              {copy.settings.security.updatePassword}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Notifications Section ───────────────────────────────────────────────────

function NotificationsSection() {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateMutation = useUpdateNotificationSettings();

  const settingsMap: Record<string, { in_app_enabled: boolean; email_enabled: boolean }> = {};
  (settings ?? []).forEach((s: any) => {
    settingsMap[s.type] = {
      in_app_enabled: s.in_app_enabled ?? true,
      email_enabled: s.email_enabled ?? true,
    };
  });

  async function handleToggle(
    type: string,
    field: "in_app_enabled" | "email_enabled",
    value: boolean
  ) {
    const current = settingsMap[type] ?? { in_app_enabled: true, email_enabled: true };
    try {
      await updateMutation.mutateAsync({
        type,
        in_app_enabled: field === "in_app_enabled" ? value : current.in_app_enabled,
        email_enabled: field === "email_enabled" ? value : current.email_enabled,
      });
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  if (isLoading) {
    return <div className="h-32 bg-muted/30 rounded-lg animate-pulse" />;
  }

  return (
    <div className="space-y-2">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-1 pb-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
          {copy.settings.notifications.type}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium w-16 text-center">
          {copy.settings.notifications.inApp}
        </p>
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium w-16 text-center">
          {copy.settings.notifications.email}
        </p>
      </div>

      {NOTIFICATION_TYPES.map(({ type, label }) => {
        const current = settingsMap[type] ?? { in_app_enabled: true, email_enabled: true };
        return (
          <div
            key={type}
            className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-1 py-2 rounded-lg hover:bg-muted/20 transition-colors"
          >
            <p className="text-sm font-medium">{label}</p>
            <div className="w-16 flex justify-center">
              <Switch
                checked={current.in_app_enabled}
                onCheckedChange={(v) => handleToggle(type, "in_app_enabled", v)}
                disabled={updateMutation.isPending}
              />
            </div>
            <div className="w-16 flex justify-center">
              <Switch
                checked={current.email_enabled}
                onCheckedChange={(v) => handleToggle(type, "email_enabled", v)}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Preferences Section ─────────────────────────────────────────────────────

function PreferencesSection() {
  const { data: settings } = useUserSettings();
  const updateSettings = useUpdateSettings();

  const [tempUnit, setTempUnit] = useState(settings?.temperature_unit ?? "F");
  const [gravityUnit, setGravityUnit] = useState(settings?.gravity_unit ?? "SG");
  const [volumeUnit, setVolumeUnit] = useState(settings?.volume_unit ?? "gallons");
  const [theme, setTheme] = useState(settings?.theme ?? "system");

  useEffect(() => {
    if (settings) {
      setTempUnit(settings.temperature_unit ?? "F");
      setGravityUnit(settings.gravity_unit ?? "SG");
      setVolumeUnit(settings.volume_unit ?? "gallons");
      setTheme(settings.theme ?? "system");
    }
  }, [settings]);

  async function handleUpdate(field: string, value: string) {
    try {
      await updateSettings.mutateAsync({ [field]: value });
      toast.success("Preference saved");
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Temp Unit */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.preferences.tempUnit}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.preferences.tempUnitDesc}</p>
        </div>
        <Select
          value={tempUnit}
          onValueChange={(v) => {
            setTempUnit(v);
            handleUpdate("temperature_unit", v);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="F">°F</SelectItem>
            <SelectItem value="C">°C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Gravity Unit */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.preferences.gravityUnit}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.preferences.gravityUnitDesc}</p>
        </div>
        <Select
          value={gravityUnit}
          onValueChange={(v) => {
            setGravityUnit(v);
            handleUpdate("gravity_unit", v);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SG">Specific Gravity</SelectItem>
            <SelectItem value="Plato">Plato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Volume Unit */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.preferences.volumeUnit}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.preferences.volumeUnitDesc}</p>
        </div>
        <Select
          value={volumeUnit}
          onValueChange={(v) => {
            setVolumeUnit(v);
            handleUpdate("volume_unit", v);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gallons">Gallons</SelectItem>
            <SelectItem value="litres">Litres</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Theme */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.preferences.theme}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.preferences.themeDesc}</p>
        </div>
        <Select
          value={theme}
          onValueChange={(v) => {
            setTheme(v);
            handleUpdate("theme", v);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Appearance */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.profile.appearance}</p>
          <p className="text-xs text-muted-foreground">{copy.settings.preferences.themeDesc}</p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

// ─── Privacy Section ─────────────────────────────────────────────────────────

function PrivacySection() {
  const { data: privacy } = useUserPrivacy();
  const updatePrivacy = useUpdatePrivacy();

  const [profileVisibility, setProfileVisibility] = useState(
    privacy?.profile_visibility ?? "public"
  );
  const [batchVisibility, setBatchVisibility] = useState(
    privacy?.batch_shelf_visibility ?? "followers_only"
  );
  const [yeastVisibility, setYeastVisibility] = useState(
    privacy?.yeast_bank_visibility ?? "followers_only"
  );

  useEffect(() => {
    if (privacy) {
      setProfileVisibility(privacy.profile_visibility ?? "public");
      setBatchVisibility(privacy.batch_shelf_visibility ?? "followers_only");
      setYeastVisibility(privacy.yeast_bank_visibility ?? "followers_only");
    }
  }, [privacy]);

  async function handleUpdate(field: string, value: string) {
    try {
      await updatePrivacy.mutateAsync({ [field]: value });
      toast.success("Privacy setting saved");
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile visibility */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.privacy.profileVisibility}</p>
          <p className="text-xs text-muted-foreground">
            {copy.settings.privacy.profileVisibilityDesc}
          </p>
        </div>
        <Select
          value={profileVisibility}
          onValueChange={(v) => {
            setProfileVisibility(v);
            handleUpdate("profile_visibility", v);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">{copy.settings.privacy.public}</SelectItem>
            <SelectItem value="private">{copy.settings.privacy.private}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Batch shelf visibility */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.privacy.batchVisibility}</p>
          <p className="text-xs text-muted-foreground">
            {copy.settings.privacy.batchVisibilityDesc}
          </p>
        </div>
        <Select
          value={batchVisibility}
          onValueChange={(v) => {
            setBatchVisibility(v);
            handleUpdate("batch_shelf_visibility", v);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">{copy.settings.privacy.everyone}</SelectItem>
            <SelectItem value="followers_only">{copy.settings.privacy.followersOnly}</SelectItem>
            <SelectItem value="only_me">{copy.settings.privacy.onlyMe}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Yeast bank visibility */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.privacy.yeastVisibility}</p>
          <p className="text-xs text-muted-foreground">
            {copy.settings.privacy.yeastVisibilityDesc}
          </p>
        </div>
        <Select
          value={yeastVisibility}
          onValueChange={(v) => {
            setYeastVisibility(v);
            handleUpdate("yeast_bank_visibility", v);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="everyone">{copy.settings.privacy.everyone}</SelectItem>
            <SelectItem value="followers_only">{copy.settings.privacy.followersOnly}</SelectItem>
            <SelectItem value="only_me">{copy.settings.privacy.onlyMe}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Danger Zone Section ─────────────────────────────────────────────────────

function DangerZoneSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState("");

  function handleExportData() {
    exportData.mutate();
  }

  function handleDeleteAccount() {
    if (confirmUsername !== user?.email) {
      toast.error("Email does not match. Please type your email to confirm.");
      return;
    }
    deleteAccount.mutate(undefined, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        navigate("/auth");
      },
    });
  }

  return (
    <div className="space-y-4">
      {/* Export data */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{copy.settings.dangerZone.exportData}</p>
          <p className="text-xs text-muted-foreground">
            {copy.settings.dangerZone.exportDataDesc}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          disabled={exportData.isPending}
        >
          <Download size={14} className="mr-1.5" />
          {copy.settings.dangerZone.exportDataBtn}
        </Button>
      </div>

      <Separator />

      {/* Delete account */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-destructive">
            {copy.settings.dangerZone.deleteAccount}
          </p>
          <p className="text-xs text-muted-foreground">
            {copy.settings.dangerZone.deleteAccountDesc}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 size={14} className="mr-1.5" />
          {copy.settings.dangerZone.deleteAccountBtn}
        </Button>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-md max-w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-slab flex items-center gap-2 text-destructive">
              <AlertTriangle size={18} />
              {copy.settings.dangerZone.deleteAccountConfirmTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {copy.settings.dangerZone.deleteAccountConfirmDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">
              {copy.settings.dangerZone.typeEmailToConfirm}
            </Label>
            <Input
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={user?.email ?? "your@email.com"}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{copy.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={
                deleteAccount.isPending ||
                confirmUsername !== user?.email ||
                !confirmUsername
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAccount.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
              {copy.settings.dangerZone.deleteAccountFinalBtn}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, description, children }: SectionProps) {
  return (
    <div className="glass-panel rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-copper/10 border border-copper/20 flex items-center justify-center">
          <Icon size={16} className="text-copper" />
        </div>
        <div>
          <h2 className="font-slab font-semibold text-base">{title}</h2>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Settings Row ────────────────────────────────────────────────────────────

interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  isDanger?: boolean;
  isActive?: boolean;
  onClick: () => void;
  isLast?: boolean;
}

function SettingsRow({
  icon: Icon,
  label,
  isDanger,
  isActive,
  onClick,
  isLast,
}: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors hover:bg-muted/20 ${
        isActive ? "bg-copper/10 text-copper" : ""
      } ${!isLast ? "border-b border-border/20" : ""}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={isDanger && !isActive ? "text-destructive" : ""} />
        <span className={`text-sm font-medium ${isDanger && !isActive ? "text-destructive" : ""}`}>
          {label}
        </span>
      </div>
      <ChevronRight size={16} className="text-muted-foreground" />
    </button>
  );
}

// ─── Settings List ───────────────────────────────────────────────────────────

interface SettingsListProps {
  sections: { id: string; icon: React.ElementType; label: string; isDanger?: boolean }[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function SettingsList({ sections, selectedId, onSelect }: SettingsListProps) {
  return (
    <div className="glass-panel rounded-xl p-0 overflow-hidden">
      {sections.map((s, i) => (
        <SettingsRow
          key={s.id}
          icon={s.icon}
          label={s.label}
          isDanger={s.isDanger}
          isActive={selectedId === s.id}
          onClick={() => onSelect(s.id)}
          isLast={i === sections.length - 1}
        />
      ))}
    </div>
  );
}

// ─── Settings Page ───────────────────────────────────────────────────────────

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [selectedSection, setSelectedSection] = useState<string | null>("account");
  const [showList, setShowList] = useState(true);

  const sections = [
    { id: "account", icon: User, label: copy.settings.sections.account },
    { id: "security", icon: Shield, label: copy.settings.sections.security },
    { id: "notifications", icon: Bell, label: copy.settings.sections.notifications },
    { id: "preferences", icon: Sliders, label: copy.settings.sections.preferences },
    { id: "privacy", icon: Eye, label: copy.settings.sections.privacy },
    { id: "signout", icon: LogOut, label: copy.profile.signOut },
    { id: "danger", icon: AlertTriangle, label: copy.settings.sections.danger, isDanger: true },
  ];

  const activeSection = sections.find((s) => s.id === selectedSection) ?? sections[0];

  function handleSelect(id: string) {
    setSelectedSection(id);
    setShowList(false);
  }

  function handleBack() {
    if (showList) {
      navigate(-1);
    } else {
      setShowList(true);
    }
  }

  const sectionContent = (
    <>
      {selectedSection === "account" && (
        <Section
          icon={User}
          title={copy.settings.sections.account}
          description={copy.settings.sections.accountDesc}
        >
          <AccountSection profile={profile} updateProfile={updateProfile} />
        </Section>
      )}
      {selectedSection === "security" && (
        <Section
          icon={Shield}
          title={copy.settings.sections.security}
          description={copy.settings.sections.securityDesc}
        >
          <SecuritySection />
        </Section>
      )}
      {selectedSection === "notifications" && (
        <Section
          icon={Bell}
          title={copy.settings.sections.notifications}
          description={copy.settings.sections.notificationsDesc}
        >
          <NotificationsSection />
        </Section>
      )}
      {selectedSection === "preferences" && (
        <Section
          icon={Sliders}
          title={copy.settings.sections.preferences}
          description={copy.settings.sections.preferencesDesc}
        >
          <PreferencesSection />
        </Section>
      )}
      {selectedSection === "privacy" && (
        <Section
          icon={Eye}
          title={copy.settings.sections.privacy}
          description={copy.settings.sections.privacyDesc}
        >
          <PrivacySection />
        </Section>
      )}
      {selectedSection === "signout" && (
        <Section
          icon={LogOut}
          title={copy.profile.signOut}
          description=""
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {copy.profile.signedInAs}{" "}
              <span className="font-medium text-foreground">{profile?.username || user?.email}</span>
            </p>
            <Button
              variant="destructive"
              size="sm"
              className="w-full sm:w-auto"
              onClick={async () => {
                try {
                  await signOut();
                  navigate("/auth");
                } catch (err: any) {
                  toast.error(err?.message || copy.common.error);
                }
              }}
            >
              <LogOut size={14} className="mr-2" />
              {copy.profile.signOut}
            </Button>
          </div>
        </Section>
      )}
      {selectedSection === "danger" && (
        <Section
          icon={AlertTriangle}
          title={copy.settings.sections.danger}
          description={copy.settings.sections.dangerDesc}
        >
          <DangerZoneSection />
        </Section>
      )}
    </>
  );

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label={copy.settings.back}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-slab text-2xl font-bold">
            {showList ? copy.settings.title : activeSection.label}
          </h1>
          <p className="text-xs text-muted-foreground">
            {showList ? copy.settings.subtitle : ""}
          </p>
        </div>
      </div>

      {/* Desktop: 2-column layout */}
      <div className="hidden md:grid md:grid-cols-[280px_1fr] md:gap-6">
        <SettingsList
          sections={sections}
          selectedId={selectedSection}
          onSelect={(id) => setSelectedSection(id)}
        />
        <div className="space-y-4">{sectionContent}</div>
      </div>

      {/* Mobile: list or section content */}
      <div className="md:hidden">
        {showList ? (
          <SettingsList
            sections={sections}
            selectedId={selectedSection}
            onSelect={handleSelect}
          />
        ) : (
          <div className="space-y-4">{sectionContent}</div>
        )}
      </div>
    </div>
  );
};

export default Settings;