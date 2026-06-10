import { FlaskConical, Award, Users, Beaker, ChevronDown, ChevronUp, Loader2, Camera, Plus, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useYeastBank, useAddYeastStrain, useDeleteYeastStrain } from "@/hooks/useYeastBank";
import { useBatches } from "@/hooks/useBatches";
import { useRecipes } from "@/hooks/useRecipes";
import { useUpload } from "@/hooks/useUpload";

const badges = [
  { name: "First Brew", icon: "🍺" },
  { name: "Kombucha King", icon: "🫖" },
  { name: "100 Readings", icon: "📊" },
  { name: "Community Star", icon: "⭐" },
  { name: "Mead Master", icon: "🍯" },
];

const AccordionSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2 font-slab font-semibold text-sm">
          <Icon size={16} className="text-copper" /> {title}
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

const Profile = () => {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: batches } = useBatches();
  const { data: recipes } = useRecipes();
  const updateProfile = useUpdateProfile();
  const { upload: uploadAvatar, uploading: avatarUploading } = useUpload('avatars');

  const { data: yeastStrains, isLoading: yeastLoading } = useYeastBank();
  const addYeast = useAddYeastStrain();
  const deleteYeast = useDeleteYeastStrain();

  const [editOpen, setEditOpen] = useState(false);
  const [newYeastOpen, setNewYeastOpen] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");

  const [yeastName, setYeastName] = useState("");
  const [yeastCode, setYeastCode] = useState("");
  const [yeastNotes, setYeastNotes] = useState("");

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const url = await uploadAvatar(file, `${profile.id}/avatar.jpg`);
    if (url) {
      await updateProfile.mutateAsync({ avatar_url: url });
    }
    e.target.value = "";
  }

  async function handleSaveProfile() {
    await updateProfile.mutateAsync({
      display_name: editDisplayName || null,
      bio: editBio || null,
      location: editLocation || null,
    });
    setEditOpen(false);
  }

  async function handleAddYeast() {
    await addYeast.mutateAsync({
      name: yeastName,
      strain_code: yeastCode || null,
      notes: yeastNotes || null,
    });
    setNewYeastOpen(false);
    setYeastName("");
    setYeastCode("");
    setYeastNotes("");
  }

  if (profileLoading) {
    return (
      <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
        <div className="h-48 bg-muted/50 rounded-xl animate-pulse" />
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass-panel rounded-xl p-6 mb-6 text-center relative">
        <label className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-copper/30 to-teal/30 border-2 border-copper/40 flex items-center justify-center mb-4 cursor-pointer block relative">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <FlaskConical size={32} className="text-copper" />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full opacity-0 hover:opacity-100 transition-opacity">
            {avatarUploading ? (
              <Loader2 size={20} className="text-white animate-spin" />
            ) : (
              <Camera size={20} className="text-white" />
            )}
          </div>
        </label>
        <h1 className="font-slab text-xl font-bold">
          {profile?.display_name || profile?.username || "Brewer"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {profile?.location ? `${profile.location} · ` : ""}
          {profile?.username ?? ""}
        </p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
          {profile?.bio || "No bio yet."}
        </p>

        <button
          onClick={() => {
            setEditDisplayName(profile?.display_name || "");
            setEditBio(profile?.bio || "");
            setEditLocation(profile?.location || "");
            setEditOpen(true);
          }}
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 text-xs hover:bg-muted transition-colors"
        >
          <Pencil size={12} /> Edit Profile
        </button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 max-w-sm mx-auto">
          {[
            { label: "Batches", value: String(batches?.length ?? 0), color: "text-copper" },
            { label: "Recipes", value: String(recipes?.length ?? 0), color: "text-teal" },
            { label: "Yeast Strains", value: String(yeastStrains?.length ?? 0), color: "text-gold" },
          ].map((s, i) => (
            <div key={i}>
              <p className={`text-2xl font-mono font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Batch shelf */}
      <div className="glass-panel rounded-xl p-4 mb-4">
        <h3 className="font-slab font-semibold text-sm mb-3">Batch Shelf</h3>
        {batches && batches.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {batches.map((b: any, i: number) => (
              <div
                key={i}
                className="shrink-0 px-3 py-2 rounded-lg bg-muted/40 border border-border/40 text-center min-w-[120px]"
              >
                <p className="text-xs font-medium truncate">{b.name}</p>
                <p className={`text-[10px] mt-0.5 ${b.status === 'active' ? 'text-teal' : 'text-muted-foreground'}`}>
                  {b.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No batches yet.</p>
        )}
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        <AccordionSection title="Awards & Badges" icon={Award}>
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/30">
                <span className="text-lg">{b.icon}</span>
                <span className="text-xs font-medium">{b.name}</span>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection title="Yeast Bank" icon={Beaker}>
          <div className="space-y-2">
            {yeastLoading ? (
              <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
            ) : (yeastStrains ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No yeast strains saved yet.</p>
            ) : (
              (yeastStrains ?? []).map((y: any) => (
                <div key={y.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/30 border border-border/20">
                  <div>
                    <p className="font-medium">{y.name}</p>
                    {y.strain_code && <p className="text-[10px] text-muted-foreground">{y.strain_code}</p>}
                  </div>
                  <button
                    onClick={() => deleteYeast.mutate(y.id)}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            <button
              onClick={() => setNewYeastOpen(true)}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border/40 hover:bg-muted text-xs transition-colors"
            >
              <Plus size={14} /> Add Yeast Strain
            </button>
          </div>
        </AccordionSection>

        <AccordionSection title="Connections" icon={Users}>
          <p className="text-sm text-muted-foreground">Connections coming soon.</p>
        </AccordionSection>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="font-slab">Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
                placeholder="Brewer Name"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label>Bio</Label>
              <Textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about your brewing style..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
              {updateProfile.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Yeast Strain Dialog */}
      <Dialog open={newYeastOpen} onOpenChange={setNewYeastOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="font-slab">Add Yeast Strain</DialogTitle>
            <DialogDescription>Track a new yeast culture.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={yeastName}
                onChange={(e) => setYeastName(e.target.value)}
                placeholder="e.g. WLP001 California Ale"
              />
            </div>
            <div>
              <Label>Strain Code</Label>
              <Input
                value={yeastCode}
                onChange={(e) => setYeastCode(e.target.value)}
                placeholder="Optional code"
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={yeastNotes}
                onChange={(e) => setYeastNotes(e.target.value)}
                placeholder="Attenuation, temp range, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleAddYeast} disabled={addYeast.isPending || !yeastName.trim()}>
              {addYeast.isPending && <Loader2 size={16} className="animate-spin mr-2" />}
              Add Strain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
