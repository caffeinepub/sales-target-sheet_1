import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import type { CategoryConfig } from "../hooks/useCategories";
import { useCategories } from "../hooks/useCategories";
import type { ColorTheme, CurrencySymbol } from "../hooks/useSettings";
import { useSettings } from "../hooks/useSettings";

const CURRENCY_OPTIONS: CurrencySymbol[] = ["₹", "$", "€", "£", "¥"];

const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: "blue", label: "Blue", swatch: "oklch(0.62 0.12 190)" },
  { id: "green", label: "Green", swatch: "oklch(0.58 0.16 145)" },
  { id: "red", label: "Red", swatch: "oklch(0.58 0.20 25)" },
  { id: "purple", label: "Purple", swatch: "oklch(0.58 0.16 295)" },
  { id: "orange", label: "Orange", swatch: "oklch(0.62 0.20 50)" },
  { id: "pink", label: "Pink", swatch: "oklch(0.60 0.20 350)" },
  { id: "indigo", label: "Indigo", swatch: "oklch(0.55 0.22 275)" },
  { id: "teal", label: "Teal", swatch: "oklch(0.58 0.18 180)" },
  { id: "gold", label: "Gold", swatch: "oklch(0.68 0.18 80)" },
];

function getDisplayNameKey(mobile: string) {
  return `display_name_${mobile}`;
}

interface InlineRenameProps {
  currentLabel: string;
  onConfirm: (newLabel: string) => void;
  onCancel: () => void;
}

function InlineRename({
  currentLabel,
  onConfirm,
  onCancel,
}: InlineRenameProps) {
  const [value, setValue] = useState(currentLabel);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleConfirm = () => {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
    else onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      <Input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-sm flex-1"
        data-ocid="settings.category.input"
      />
      <button
        type="button"
        onClick={handleConfirm}
        className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors flex-shrink-0"
        aria-label="Confirm rename"
        data-ocid="settings.category.confirm_button"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 rounded text-muted-foreground hover:bg-secondary transition-colors flex-shrink-0"
        aria-label="Cancel rename"
        data-ocid="settings.category.cancel_button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface CategoryRowProps {
  cat: CategoryConfig;
  index: number;
  onRename: (key: string, newLabel: string) => void;
  onDelete: (key: string) => void;
}

function CategoryRow({ cat, index, onRename, onDelete }: CategoryRowProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleConfirm = (newLabel: string) => {
    onRename(cat.key, newLabel);
    setIsRenaming(false);
  };

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors group"
      data-ocid={`settings.category.item.${index}`}
    >
      {isRenaming ? (
        <InlineRename
          currentLabel={cat.label}
          onConfirm={handleConfirm}
          onCancel={() => setIsRenaming(false)}
        />
      ) : confirmDelete ? (
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm text-muted-foreground flex-1">
            Delete <strong>{cat.label}</strong>?
          </span>
          <button
            type="button"
            onClick={() => {
              onDelete(cat.key);
              setConfirmDelete(false);
            }}
            className="px-3 py-1 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
            data-ocid={`settings.category.confirm_delete.${index}`}
          >
            Yes, Delete
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="px-3 py-1 rounded text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors"
            data-ocid={`settings.category.cancel_delete.${index}`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span className="font-medium text-foreground text-sm flex-1">
            {cat.label}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setIsRenaming(true)}
              aria-label={`Rename ${cat.label}`}
              data-ocid={`settings.category.edit_button.${index}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${cat.label}`}
              data-ocid={`settings.category.delete_button.${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

interface UserRowProps {
  userMobile: string;
  isSelf: boolean;
  adminMobile: string;
  onDelete: (target: string) => void;
}

function UserRow({ userMobile, isSelf, adminMobile, onDelete }: UserRowProps) {
  const { actor } = useActor();
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!actor) return;
    setDeleting(true);
    try {
      await actor.deleteUser(adminMobile, userMobile);
      onDelete(userMobile);
    } catch {
      // ignore
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border last:border-b-0 group">
      <div className="flex items-center gap-2 flex-1">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
          {userMobile.slice(0, 2)}
        </div>
        <span className="text-sm font-medium text-foreground">
          {userMobile}
        </span>
        {isSelf && (
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            You (Admin)
          </span>
        )}
      </div>
      {!isSelf &&
        (confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Remove?</span>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-2 py-1 rounded text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
              data-ocid="settings.user.confirm_button"
            >
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 rounded text-xs font-medium border border-border text-foreground hover:bg-secondary transition-colors"
              data-ocid="settings.user.cancel_button"
            >
              No
            </button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete user ${userMobile}`}
            data-ocid="settings.user.delete_button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        ))}
    </div>
  );
}

interface PratikSoniPageProps {
  mobile: string;
  onNameChange?: (name: string) => void;
}

export default function PratikSoniPage({
  mobile,
  onNameChange,
}: PratikSoniPageProps) {
  const { currencySymbol, colorTheme, setCurrencySymbol, setColorTheme } =
    useSettings();
  const {
    categories,
    hiddenCategories,
    addCategory,
    renameCategory,
    deleteCategory,
    restoreCategory,
  } = useCategories(mobile);
  const visibleCategories = categories.filter((c) => c.visible);

  const { actor } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // ── Profile / Display Name state ──
  const nameKey = getDisplayNameKey(mobile);
  const [displayName, setDisplayName] = useState<string>(
    () => localStorage.getItem(nameKey) ?? "",
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const handleEditNameOpen = () => {
    setNameInput(displayName || mobile);
    setIsEditingName(true);
  };

  const handleNameSave = () => {
    const trimmed = nameInput.trim();
    const saved = trimmed || "";
    localStorage.setItem(nameKey, saved);
    setDisplayName(saved);
    setIsEditingName(false);
    onNameChange?.(saved);
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleNameSave();
    if (e.key === "Escape") handleNameCancel();
  };

  useEffect(() => {
    if (!actor || !mobile) return;
    let cancelled = false;
    actor
      .isAdminUser(mobile)
      .then((admin) => {
        if (cancelled) return;
        setIsAdmin(admin);
        if (admin) {
          setUsersLoading(true);
          actor
            .listUsers()
            .then((list) => {
              if (!cancelled) {
                setUsers(list);
                setUsersLoading(false);
              }
            })
            .catch(() => {
              if (!cancelled) setUsersLoading(false);
            });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [actor, mobile]);

  const handleUserDeleted = (deletedMobile: string) => {
    setUsers((prev) => prev.filter((u) => u !== deletedMobile));
  };

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");

  const handleAddConfirm = () => {
    const trimmed = newCategoryLabel.trim();
    if (trimmed) addCategory(trimmed);
    setIsAddingCategory(false);
    setNewCategoryLabel("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-2xl mx-auto"
      data-ocid="settings.section"
    >
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          PRATIK SONI
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personalisation &amp; App Settings
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Profile Section ── */}
        <section
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          data-ocid="settings.profile.section"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your display name shown in the app
            </p>
          </div>
          <div className="px-5 py-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleNameKeyDown}
                  placeholder="Enter your name..."
                  className="h-9 text-sm flex-1"
                  data-ocid="settings.profile.input"
                />
                <button
                  type="button"
                  onClick={handleNameSave}
                  className="p-2 rounded text-green-600 hover:bg-green-50 transition-colors flex-shrink-0"
                  aria-label="Save display name"
                  data-ocid="settings.profile.save_button"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNameCancel}
                  className="p-2 rounded text-muted-foreground hover:bg-secondary transition-colors flex-shrink-0"
                  aria-label="Cancel editing name"
                  data-ocid="settings.profile.cancel_button"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {displayName || mobile}
                  </span>
                  {displayName && (
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {mobile}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground flex-shrink-0"
                  onClick={handleEditNameOpen}
                  aria-label="Edit display name"
                  data-ocid="settings.profile.edit_button"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ── Currency Section ── */}
        <section
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          data-ocid="settings.currency.section"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Currency Symbol
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applied to all Target, Achieved, and Remaining values across the
              app.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {CURRENCY_OPTIONS.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => setCurrencySymbol(sym)}
                  className={`min-w-[3rem] h-11 px-4 rounded-lg border-2 text-lg font-semibold transition-all ${
                    currencySymbol === sym
                      ? "border-primary text-primary bg-primary/10 shadow-sm"
                      : "border-border text-foreground hover:border-primary/50 hover:bg-secondary"
                  }`}
                  aria-pressed={currencySymbol === sym}
                  data-ocid="settings.currency.toggle"
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Colour Theme Section ── */}
        <section
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          data-ocid="settings.theme.section"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Site Colour Theme
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Changes the accent colour used throughout the entire application.
            </p>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setColorTheme(theme.id)}
                  className={`relative flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                    colorTheme === theme.id
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:border-primary/40 hover:bg-secondary"
                  }`}
                  aria-pressed={colorTheme === theme.id}
                  data-ocid="settings.theme.toggle"
                >
                  <span
                    className="w-10 h-10 rounded-full shadow-sm border border-white/20 flex-shrink-0"
                    style={{ background: theme.swatch }}
                  />
                  <span
                    className={`text-xs font-medium ${
                      colorTheme === theme.id
                        ? "text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {theme.label}
                  </span>
                  {colorTheme === theme.id && (
                    <span className="absolute top-1.5 right-1.5">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category Names Section ── */}
        <section
          className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
          data-ocid="settings.categories.section"
        >
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">
              Sales Categories
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add, rename, or delete categories. Changes apply across all views.
            </p>
          </div>
          <div>
            {visibleCategories.map((cat, idx) => (
              <CategoryRow
                key={cat.key}
                cat={cat}
                index={idx + 1}
                onRename={renameCategory}
                onDelete={deleteCategory}
              />
            ))}
            {visibleCategories.length === 0 && !isAddingCategory && (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                All categories have been deleted. Restore them below or add a
                new one.
              </p>
            )}
          </div>

          {/* Add new category */}
          {isAddingCategory ? (
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <Input
                autoFocus
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddConfirm();
                  if (e.key === "Escape") setIsAddingCategory(false);
                }}
                placeholder="Category name..."
                className="h-8 text-sm flex-1"
                data-ocid="settings.category.input"
              />
              <button
                type="button"
                onClick={handleAddConfirm}
                className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"
                aria-label="Confirm add category"
                data-ocid="settings.category.confirm_button"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-1.5 rounded text-muted-foreground hover:bg-secondary transition-colors"
                aria-label="Cancel add category"
                data-ocid="settings.category.cancel_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingCategory(true);
                  setNewCategoryLabel("");
                }}
                className="w-full"
                data-ocid="settings.category.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          )}

          {/* Restore deleted categories */}
          {hiddenCategories.length > 0 && (
            <div className="px-4 py-3 bg-secondary/40 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Deleted categories — click to restore:
              </p>
              <div className="flex flex-wrap gap-2">
                {hiddenCategories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => restoreCategory(cat.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-secondary transition-colors"
                    data-ocid={`settings.category.restore.${cat.key}`}
                  >
                    <RotateCcw className="w-3 h-3" />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── User Management Section (Admin only) ── */}
        {isAdmin && (
          <section
            className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
            data-ocid="settings.users.section"
          >
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">
                User Management
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage registered users. Only admins can see this section.
              </p>
            </div>
            <div>
              {usersLoading ? (
                <div
                  className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground"
                  data-ocid="settings.users.loading_state"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading users...
                </div>
              ) : users.length === 0 ? (
                <p
                  className="px-4 py-4 text-sm text-muted-foreground"
                  data-ocid="settings.users.empty_state"
                >
                  No users found.
                </p>
              ) : (
                users.map((u) => (
                  <UserRow
                    key={u}
                    userMobile={u}
                    isSelf={u === mobile}
                    adminMobile={mobile}
                    onDelete={handleUserDeleted}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </motion.div>
  );
}
