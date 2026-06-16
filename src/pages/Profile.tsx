import {
  FlaskConical,
  Award,
  Users,
  Beaker,
  Camera,
  Plus,
  Trash2,
  Pencil,
  Settings,
  LogOut,
  UserPlus,
  UserMinus,
  Loader2,
  Star,
  FileText,
  Package,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { copy } from "@/constants/copy";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { useYeastBank, useAddYeastStrain, useDeleteYeastStrain } from "@/hooks/useYeastBank";
import { useBadges, useUserBadges, useAwardBadges } from "@/hooks/useUserBadges";
import { useBatches } from "@/hooks/useBatches";
import { useRecipes } from "@/hooks/useRecipes";
import { usePosts } from "@/hooks/usePosts";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  useIsFollowing,
  useFollowerCount,
  useFollowingCount,
  useFollowers,
  useFollowing,
  useFollow,
  useUnfollow,
} from "@/hooks/useFollows";
import type { Database } from "@/types/database";

type BatchStatus = Database["public"]["Enums"]["batch_status"];

// ─── Followers / Following Modal ────────────────────────────────────────────

interface ConnectionsModalProps {
  open: boolean;
  onClose: () => void;
  tab: "followers" | "following";
  onTabChange: (tab: "followers" | "following") => void;
  targetId: string;
}

function ConnectionsModal({
  open,
  onClose,
  tab,
  onTabChange,
  targetId,
}: ConnectionsModalProps) {
  const { data: followersList } = useFollowers(targetId);
  const { data: followingList } = useFollowing(targetId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();
  const { user } = useAuth();
  const { data: isFollowingMap } = useQuery({
    queryKey: ["following-check", targetId],
    queryFn: async () => {
      if (!user || !targetId) return new Set<string>();
      const ids =
        tab === "followers"
          ? (followersList ?? []).map((f: any) => f.follower_id)
          : (followingList ?? []).map((f: any) => f.followed_id);
      if (ids.length === 0) return new Set<string>();
      const { data } = await supabase
        .from("follows")
        .select("followed_id")
        .eq("follower_id", user.id)
        .in("followed_id", ids);
      return new Set((data ?? []).map((r: any) => r.followed_id));
    },
    enabled: open && !!user && ((followersList?.length ?? 0) > 0 || (followingList?.length ?? 0) > 0),
  });

  const list =
    tab === "followers"
      ? (followersList ?? [])
      : (followingList ?? []);
  const count = tab === "followers" ? (followersList?.length ?? 0) : (followingList?.length ?? 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-full max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-slab">
            {tab === "followers" ? copy.profile.followers : copy.profile.following}
          </DialogTitle>
          <DialogDescription>
            {count} {tab === "followers" ? copy.profile.followers.toLowerCase() : copy.profile.following.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange("followers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "followers"
                ? "bg-copper/20 text-copper"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.profile.followers} ({(followersList ?? []).length})
          </button>
          <button
            onClick={() => onTabChange("following")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "following"
                ? "bg-copper/20 text-copper"
                : "bg-muted/30 text-muted-foreground hover:text-foreground"
            }`}
          >
            {copy.profile.following} ({(followingList ?? []).length})
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {list.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              {tab === "followers" ? copy.profile.noFollowersYet : copy.profile.notFollowingAnyone}
            </p>
          ) : (
            list.map((item: any) => {
              const otherId =
                tab === "followers" ? item.follower_id : item.followed_id;
              const profile =
                tab === "followers" ? item.follower_profile : item.followed_profile;
              const isSelf = otherId === user?.id;
              const isFollowingThis = isFollowingMap?.has(otherId) ?? false;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-copper/30 to-teal/30 border border-copper/30 flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
                    onClick={() => {
                      if (!isSelf) window.location.href = `/profile/${otherId}`;
                    }}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FlaskConical size={16} className="text-copper" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate cursor-pointer hover:underline"
                      onClick={() => !isSelf && window.location.assign(`/profile/${otherId}`)}
                    >
                      {profile?.display_name || profile?.username || "Brewer"}
                    </p>
                    {profile?.username && (
                      <p className="text-[10px] text-muted-foreground">@{profile.username}</p>
                    )}
                  </div>
                  {!isSelf && user && (
                    <Button
                      size="sm"
                      variant={isFollowingThis ? "outline" : "default"}
                      className="text-xs h-7 px-2"
                      onClick={async () => {
                        try {
                          if (isFollowingThis) {
                            await unfollowMutation.mutateAsync(otherId);
                            toast.success("Unfollowed");
                          } else {
                            await followMutation.mutateAsync(otherId);
                            toast.success("Following!");
                          }
                        } catch (err: any) {
                          toast.error(err?.message || copy.common.error);
                        }
                      }}
                      disabled={followMutation.isPending || unfollowMutation.isPending}
                    >
                      {isFollowingThis ? copy.profile.unfollow : copy.profile.follow}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Profile Dialog ────────────────────────────────────────────────────

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: any;
  updateProfile: any;
}

function EditProfileDialog({ open, onClose, profile, updateProfile }: EditProfileDialogProps) {
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");

  // Sync state when dialog opens
  useState(() => {
    if (open) {
      setEditDisplayName(profile?.display_name || "");
      setEditBio(profile?.bio || "");
      setEditLocation(profile?.location || "");
    }
  });

  async function handleSaveProfile() {
    try {
      await updateProfile.mutateAsync({
        display_name: editDisplayName || null,
        bio: editBio || null,
        location: editLocation || null,
      });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-full">
        <DialogHeader>
          <DialogTitle className="font-slab">{copy.profile.editProfileTitle}</DialogTitle>
          <DialogDescription>{copy.profile.editProfileDescription}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{copy.profile.displayName}</Label>
            <Input
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder={copy.profile.displayNamePlaceholder}
            />
          </div>
          <div>
            <Label>{copy.profile.location}</Label>
            <Input
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              placeholder={copy.profile.locationPlaceholder}
            />
          </div>
          <div>
            <Label>{copy.profile.bio}</Label>
            <Textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              placeholder={copy.profile.bioPlaceholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
            {updateProfile.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
            {copy.profile.saveChanges}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Yeast Dialog ───────────────────────────────────────────────────────

interface AddYeastDialogProps {
  open: boolean;
  onClose: () => void;
  addYeast: any;
}

function AddYeastDialog({ open, onClose, addYeast }: AddYeastDialogProps) {
  const [yeastName, setYeastName] = useState("");
  const [yeastCode, setYeastCode] = useState("");
  const [yeastNotes, setYeastNotes] = useState("");

  function handleClose() {
    setYeastName("");
    setYeastCode("");
    setYeastNotes("");
    onClose();
  }

  async function handleAddYeast() {
    try {
      await addYeast.mutateAsync({
        name: yeastName,
        strain_code: yeastCode || null,
        notes: yeastNotes || null,
      });
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-w-full">
        <DialogHeader>
          <DialogTitle className="font-slab">{copy.profile.addYeastStrain}</DialogTitle>
          <DialogDescription>Track a new yeast culture.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{copy.profile.yeastName}</Label>
            <Input
              value={yeastName}
              onChange={(e) => setYeastName(e.target.value)}
              placeholder={copy.profile.yeastNamePlaceholder}
            />
          </div>
          <div>
            <Label>{copy.profile.strainCode}</Label>
            <Input
              value={yeastCode}
              onChange={(e) => setYeastCode(e.target.value)}
              placeholder={copy.profile.strainCodePlaceholder}
            />
          </div>
          <div>
            <Label>{copy.profile.notes}</Label>
            <Textarea
              value={yeastNotes}
              onChange={(e) => setYeastNotes(e.target.value)}
              placeholder={copy.profile.notesPlaceholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddYeast} disabled={addYeast.isPending || !yeastName.trim()}>
            {addYeast.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
            {copy.profile.addStrain}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────

function StarRating({ value }: { value: number | null }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          className={n <= value ? "text-gold fill-gold" : "text-muted"}
        />
      ))}
    </div>
  );
}

// ─── Profile Page ───────────────────────────────────────────────────────────

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { id: profileId } = useParams<{ id: string }>();
  const isOwnProfile = !profileId || profileId === user?.id;
  const targetId = profileId || user?.id;

  // Fetch viewed profile
  const { data: viewedProfile, isLoading: viewedProfileLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, batches(count), recipes(count)")
        .eq("id", profileId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const { data: ownProfile, isLoading: ownProfileLoading } = useProfile();
  const profile = isOwnProfile ? ownProfile : viewedProfile;
  const profileLoading = isOwnProfile ? ownProfileLoading : viewedProfileLoading;

  const updateProfile = useUpdateProfile();
  const { upload: uploadAvatar, uploading: avatarUploading } = useUpload("avatars");
  const { upload: uploadCover, uploading: coverUploading } = useUpload("covers");

  // Follow hooks
  const { data: isFollowing } = useIsFollowing(targetId);
  const { data: followerCount } = useFollowerCount(targetId);
  const { data: followingCount } = useFollowingCount(targetId);
  const followMutation = useFollow();
  const unfollowMutation = useUnfollow();

  // Data hooks
  const { data: batches } = useBatches();
  const { data: recipes } = useRecipes();
  const { data: yeastStrains, isLoading: yeastLoading } = useYeastBank();
  const addYeast = useAddYeastStrain();
  const deleteYeast = useDeleteYeastStrain();

  // Brew logs for viewed profile
  const { data: userPosts } = usePosts(undefined, 1, "latest", targetId);

  // Awards & Badges hooks — must be at top level (Rules of Hooks)
  const { data: allBadges } = useBadges();
  const { data: earnedBadges } = useUserBadges(targetId);
  useAwardBadges();

  const earnedIds = new Set((earnedBadges ?? []).map((b: any) => b.id));
  const earnedMap: Record<string, any> = {};
  (earnedBadges ?? []).forEach((b: any) => { earnedMap[b.id] = b; });

  // Local state
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<"followers" | "following">("followers");
  const [editOpen, setEditOpen] = useState(false);
  const [newYeastOpen, setNewYeastOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("brewlogs");
  const [recipeTab, setRecipeTab] = useState<"mine" | "saved">("mine");

  // ─── Handlers ───────────────────────────────────────────────────────────────

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const url = await uploadAvatar(file, `${profile.id}/avatar.jpg`);
      if (url) {
        await updateProfile.mutateAsync({ avatar_url: url });
      }
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
    e.target.value = "";
  }

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      const url = await uploadCover(file, `${profile.id}/cover.jpg`);
      if (url) {
        await updateProfile.mutateAsync({ cover_photo_url: url });
      }
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
    e.target.value = "";
  }

  async function handleFollowToggle() {
    if (!targetId) return;
    try {
      if (isFollowing) {
        await unfollowMutation.mutateAsync(targetId);
        toast.success("Unfollowed");
      } else {
        await followMutation.mutateAsync(targetId);
        toast.success("Following!");
      }
    } catch (err: any) {
      toast.error(err?.message || copy.common.error);
    }
  }

  // ─── Derived data ───────────────────────────────────────────────────────────

  const finishedBatches = (batches ?? []).filter(
    (b: any) => b.status === "finished" || b.status === "batch_shelf"
  );
  const activeBatches = (batches ?? []).filter(
    (b: any) => b.status !== "finished" && b.status !== "batch_shelf"
  );

  const myRecipes = (recipes ?? []).filter((r: any) => r.user_id === targetId);
  const savedRecipes = (recipes ?? []).filter((r: any) => r.starred === true);

  const brewLogPosts = (userPosts?.posts ?? []).filter(
    (p: any) => p.category === "brew_log" || p.category === "troubleshooting" || p.category === "tasting"
  );

  const statsBatches = batches?.length ?? 0;
  const statsRecipes = recipes?.length ?? 0;

  // ─── Lab Stats ───────────────────────────────────────────────────────────────
  const completedBatches = (batches ?? []).filter(
    (b: any) => b.status === "finished" || b.status === "batch_shelf" || b.status === "completed"
  );

  let avgBrewDays = 0;
  if (completedBatches.length > 0) {
    const totalDays = completedBatches.reduce((sum: number, b: any) => {
      if (!b.start_date) return sum;
      const end = b.completed_date ? new Date(b.completed_date) : new Date();
      const start = new Date(b.start_date);
      return sum + Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    avgBrewDays = Math.round(totalDays / completedBatches.length);
  }

  // Favourite style: most frequent batch.type, ties broken by first occurrence
  const styleCount: Record<string, number> = {};
  let styleOrder: string[] = [];
  (batches ?? []).forEach((b: any) => {
    if (b.type) {
      if (!(b.type in styleCount)) {
        styleOrder.push(b.type);
        styleCount[b.type] = 0;
      }
      styleCount[b.type]++;
    }
  });
  let favouriteStyle = "—";
  if (styleOrder.length > 0) {
    favouriteStyle = styleOrder.reduce((best, s) =>
      styleCount[s] > styleCount[best] ? s : best, styleOrder[0]
    );
  }

  // ─── Loading skeleton ───────────────────────────────────────────────────────

  if (profileLoading) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
        <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  const sidebarContent = (
    <>
      <div className="border-t border-border/40 pt-4">
        <h3 className="font-slab font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
          <Award size={12} className="text-gold" />
          {copy.profile.badges ?? "Awards & Badges"}
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {(allBadges ?? []).map((badge: any) => {
            const earned = earnedIds.has(badge.id);
            const earnedBadge = earnedMap[badge.id];
            return (
              <div
                key={badge.id}
                title={badge.description}
                className={`flex flex-col items-center p-3 rounded-lg text-center transition-colors ${
                  earned
                    ? "bg-gold/10 border border-gold/30"
                    : "bg-muted/10 border border-border/20 opacity-40"
                }`}
              >
                <span className="text-2xl leading-none mb-1">{badge.icon_url || "🏅"}</span>
                <p className={`text-[10px] font-medium leading-tight ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                  {badge.name}
                </p>
                {earned && earnedBadge?.awarded_at && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    {new Date(earnedBadge.awarded_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-border/40 pt-4">
        <h3 className="font-slab font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-1.5">
          <Beaker size={12} className="text-teal" />
          {copy.profile.labStats}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: copy.profile.totalBatches, value: statsBatches, accent: "text-copper" },
            { label: copy.profile.completedBatches, value: completedBatches.length, accent: "text-teal" },
            { label: copy.profile.avgBrewDays, value: avgBrewDays > 0 ? `${avgBrewDays}d` : "—", accent: "text-gold" },
            { label: copy.profile.favouriteStyle, value: favouriteStyle, accent: "text-copper" },
          ].map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/20 border border-border/20 text-center"
            >
              <p className={`text-2xl font-mono font-bold ${stat.accent}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-4">
      {/* ── Cover Photo ─────────────────────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden h-44">
        <div className="w-full h-full bg-gradient-to-r from-copper/40 via-teal/30 to-gold/30 flex items-center justify-center">
          {profile?.cover_photo_url ? (
            <img
              src={profile.cover_photo_url}
              alt={copy.profile.noCoverPhoto}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-muted-foreground text-sm">{copy.profile.noCoverPhoto}</span>
          )}
        </div>
        {isOwnProfile && (
          <label className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 hover:bg-black/70 cursor-pointer transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            {coverUploading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : (
              <Camera size={16} className="text-white" />
            )}
          </label>
        )}
      </div>

      {/* ── Profile Header Card ─────────────────────────────────────────────── */}
      <div className="glass-panel rounded-xl p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <label className="w-20 h-20 rounded-full bg-gradient-to-br from-copper/30 to-teal/30 border-2 border-copper/40 flex items-center justify-center shrink-0 cursor-pointer block relative group">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <FlaskConical size={32} className="text-copper" />
            )}
            {isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {avatarUploading ? (
                  <Loader2 size={20} className="text-white animate-spin" />
                ) : (
                  <Camera size={20} className="text-white" />
                )}
              </div>
            )}
          </label>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h1 className="font-slab text-xl font-bold leading-tight">
                  {profile?.display_name || profile?.username || "Brewer"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.location ? `${profile.location} · ` : ""}
                  @{profile?.username}
                </p>
              </div>
              {isOwnProfile ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings size={12} className="mr-1" />
                    {copy.settings.title}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs shrink-0"
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil size={12} className="mr-1" />
                    {copy.profile.editProfile}
                  </Button>
                </div>
              ) : (
                <Button
                  variant={isFollowing ? "outline" : "default"}
                  size="sm"
                  className="text-xs shrink-0"
                  onClick={handleFollowToggle}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : isFollowing ? (
                    <UserMinus size={12} className="mr-1" />
                  ) : (
                    <UserPlus size={12} className="mr-1" />
                  )}
                  {isFollowing ? copy.profile.unfollow : copy.profile.follow}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              {profile?.bio || copy.profile.noBioYet}
            </p>
          </div>
        </div>

        {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mt-5 max-w-sm mx-auto border-t border-border/40 pt-4">
          {[
            {
              label: copy.profile.batches,
              value: statsBatches,
              onClick: () => {
                setActiveTab("shelf");
              },
            },
            {
              label: copy.profile.recipes,
              value: statsRecipes,
              onClick: () => {
                setActiveTab("recipes");
              },
            },
            {
              label: copy.profile.followers,
              value: followerCount ?? 0,
              onClick: () => {
                setConnectionsTab("followers");
                setConnectionsOpen(true);
              },
            },
            {
              label: copy.profile.following,
              value: followingCount ?? 0,
              onClick: () => {
                setConnectionsTab("following");
                setConnectionsOpen(true);
              },
            },
          ].map((s, i) => (
            <button
              key={i}
              onClick={s.onClick}
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <p className="text-2xl font-mono font-bold text-copper">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </button>
          ))}
        </div>

      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="xl:grid xl:grid-cols-[1fr_280px] gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full min-w-0">
        <TabsList className="w-full justify-start gap-1 flex-wrap h-auto p-1">
          <TabsTrigger value="brewlogs" className="text-xs gap-1.5">
            <FileText size={13} />
            {copy.profile.brewLogs}
          </TabsTrigger>
          <TabsTrigger value="recipes" className="text-xs gap-1.5">
            <Star size={13} />
            {copy.profile.recipes}
          </TabsTrigger>
          <TabsTrigger value="shelf" className="text-xs gap-1.5">
            <Package size={13} />
            {copy.profile.batchShelf}
          </TabsTrigger>
          <TabsTrigger value="yeast" className="text-xs gap-1.5">
            <Beaker size={13} />
            {copy.profile.yeastBank}
          </TabsTrigger>
        </TabsList>

        {/* Brew logs tab */}
        <TabsContent value="brewlogs" className="mt-3 space-y-3">
          {brewLogPosts.length === 0 ? (
            <div className="glass-panel rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">{copy.profile.noBrewLogsYet}</p>
            </div>
          ) : (
            brewLogPosts.map((post: any) => (
              <div
                key={post.id}
                className="glass-panel rounded-xl p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => navigate(`/community?post=${post.id}`)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={post.profiles?.avatar_url} />
                    <AvatarFallback>
                      <FlaskConical size={14} className="text-copper" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {post.profiles?.display_name || post.profiles?.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">
                        {post.category?.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold mb-1 line-clamp-1">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                      {post.likes > 0 && (
                        <span className="text-[10px] flex items-center gap-1">
                          <Star size={11} className="text-gold" /> {post.likes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {/* Recipes tab */}
        <TabsContent value="recipes" className="mt-3">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setRecipeTab("mine")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                recipeTab === "mine"
                  ? "bg-copper/20 text-copper"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.profile.myRecipes}
            </button>
            <button
              onClick={() => setRecipeTab("saved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                recipeTab === "saved"
                  ? "bg-copper/20 text-copper"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              {copy.profile.savedRecipes}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(recipeTab === "mine" ? myRecipes : savedRecipes).length === 0 ? (
              <div className="col-span-2 glass-panel rounded-xl p-8 text-center">
                <p className="text-sm text-muted-foreground">{copy.profile.noRecipesYet}</p>
              </div>
            ) : (
              (recipeTab === "mine" ? myRecipes : savedRecipes).map((recipe: any) => (
                <div
                  key={recipe.id}
                  className="glass-panel rounded-xl p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => navigate(`/recipes/${recipe.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold line-clamp-1">{recipe.title}</h3>
                    {recipe.starred && <Star size={14} className="text-gold fill-gold shrink-0" />}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                    {recipe.type && (
                      <span className="px-2 py-0.5 rounded-full bg-muted capitalize">{recipe.type}</span>
                    )}
                    {recipe.style && <span>{recipe.style}</span>}
                    {recipe.abv != null && <span>{recipe.abv}% ABV</span>}
                  </div>
                  {recipe.moderation_status === "rejected" && (
                    <p className="text-[10px] text-destructive mt-2">Rejected: {recipe.rejection_reason}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Batch shelf tab */}
        <TabsContent value="shelf" className="mt-3 space-y-4">
          {/* Active batches */}
          {activeBatches.length > 0 && (
            <div>
              <h3 className="font-slab font-semibold text-sm mb-2 px-1">{copy.profile.batchShelf}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeBatches.map((batch: any) => (
                  <div
                    key={batch.id}
                    className="glass-panel rounded-xl p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/batches/${batch.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold line-clamp-1">{batch.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal/20 text-teal capitalize shrink-0">
                        {batch.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      {batch.type && <span className="capitalize">{batch.type}</span>}
                      {batch.srm != null && <span>SRM {batch.srm}</span>}
                      {batch.og != null && <span>OG {batch.og}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finished batches */}
          {finishedBatches.length > 0 && (
            <div>
              <h3 className="font-slab font-semibold text-sm mb-2 px-1 text-muted-foreground">
                {copy.profile.finished}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {finishedBatches.map((batch: any) => (
                  <div
                    key={batch.id}
                    className="glass-panel rounded-xl p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/batches/${batch.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold line-clamp-1">{batch.name}</h3>
                      <StarRating value={batch.star_rating} />
                    </div>
                    <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
                      {batch.type && <span className="capitalize">{batch.type}</span>}
                      {batch.srm != null && <span>SRM {batch.srm}</span>}
                      {batch.completed_date && (
                        <span>{new Date(batch.completed_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {finishedBatches.length === 0 && activeBatches.length === 0 && (
            <div className="glass-panel rounded-xl p-8 text-center">
              <p className="text-sm text-muted-foreground">{copy.profile.noBatchesYet}</p>
            </div>
          )}
        </TabsContent>

        {/* Yeast bank tab */}
        <TabsContent value="yeast" className="mt-3">
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-slab font-semibold text-sm">{copy.profile.yeastBank}</h3>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={() => setNewYeastOpen(true)}
              >
                <Plus size={12} className="mr-1" />
                {copy.profile.addYeastStrain}
              </Button>
            </div>

            {yeastLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (yeastStrains ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">{copy.profile.noYeastStrainsYet}</p>
            ) : (
              <div className="space-y-2">
                {(yeastStrains ?? []).map((y: any) => (
                  <div
                    key={y.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{y.name}</p>
                      {y.strain_code && (
                        <p className="text-[10px] text-muted-foreground">{copy.profile.strainCode}: {y.strain_code}</p>
                      )}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-muted-foreground">
                        {y.source && <span>{copy.profile.source}: {y.source}</span>}
                        {y.generation != null && <span>{copy.profile.generation}: {y.generation}</span>}
                        {y.storage_date && <span>{copy.profile.storageDate}: {new Date(y.storage_date).toLocaleDateString()}</span>}
                        {y.viability_notes && <span>{copy.profile.viability}: {y.viability_notes}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        deleteYeast.mutate(y.id, {
                          onError: (err: any) => toast.error(err?.message || copy.common.error),
                        })
                      }
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <aside className="hidden xl:block space-y-4">
        {sidebarContent}
      </aside>
      </div>
      <div className="xl:hidden mt-6 space-y-4">
        {sidebarContent}
      </div>

      {/* ── Account Settings (own profile only) ──────────────────────────────── */}
      {isOwnProfile && (
        <div className="glass-panel rounded-xl p-4 mt-2">
          <h3 className="font-slab font-semibold text-sm mb-3 flex items-center gap-2">
            <Settings size={14} className="text-copper" />
            {copy.profile.accountSettings}
          </h3>
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              {copy.profile.signedInAs}{" "}
              <span className="font-medium text-foreground">{profile?.username || user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm">{copy.profile.appearance}</span>
              <ThemeToggle />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
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
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <ConnectionsModal
        open={connectionsOpen}
        onClose={() => setConnectionsOpen(false)}
        tab={connectionsTab}
        onTabChange={setConnectionsTab}
        targetId={targetId ?? ""}
      />

      {isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          profile={profile}
          updateProfile={updateProfile}
        />
      )}

      <AddYeastDialog
        open={newYeastOpen}
        onClose={() => setNewYeastOpen(false)}
        addYeast={addYeast}
      />
    </div>
  );
};

export default Profile;