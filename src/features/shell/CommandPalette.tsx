import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_BY_ROLE } from "@/features/nav/nav-config";
import { QUICK_ACTIONS } from "@/features/shell/TopNav";
import { useRole } from "@/hooks/use-role";
import { useUiStore } from "@/store/ui-store";
import { ArrowRight, Bot, Clock, Navigation, Sparkles, Zap } from "lucide-react";
import { useNavigate } from "react-router";

/**
 * CommandPalette — Ctrl/⌘+K navigation, quick actions, saved searches and an
 * "ask the copilot" fallback that hands the query to the chat workspace.
 */
export function CommandPalette() {
  const open = useUiStore((state) => state.commandOpen);
  const setOpen = useUiStore((state) => state.setCommandOpen);
  const recentSearches = useUiStore((state) => state.recentSearches);
  const pushRecentSearch = useUiStore((state) => state.pushRecentSearch);
  const { role } = useRole();
  const navigate = useNavigate();

  const sections = NAV_BY_ROLE[role];

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command palette"
      description="Navigate the workstation, run a quick action or ask the AI copilot."
      className="glass-strong border-white/80 bg-white/90 sm:max-w-xl"
    >
      <CommandInput placeholder="Type a command, asset tag or question…" />
      <CommandList className="thin-scroll max-h-[380px]">
        <CommandEmpty className="px-4 py-6 text-xs text-muted-foreground">
          No direct match. Press Enter to ask the AI copilot instead.
        </CommandEmpty>

        {sections.map((section) => (
          <CommandGroup
            key={section.title}
            heading={`${section.title} · navigation`}
          >
            {section.items.map((item) => (
              <CommandItem
                key={item.to}
                value={`${item.label} ${item.hint ?? ""} ${item.to}`}
                onSelect={() => go(item.to)}
                className="cursor-pointer gap-2"
              >
                <item.icon className="size-3.5 text-muted-foreground" />
                <span className="text-sm">{item.label}</span>
                {item.hint ? (
                  <span className="ml-2 hidden truncate text-[11px] text-muted-foreground sm:inline">
                    {item.hint}
                  </span>
                ) : null}
                <CommandShortcut className="ml-auto text-[10px]">
                  <ArrowRight className="size-3" />
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        <CommandSeparator />

        <CommandGroup heading="Quick actions">
          {QUICK_ACTIONS.map((action) => (
            <CommandItem
              key={action.label}
              value={`${action.label} ${action.to}`}
              onSelect={() => go(action.to)}
              className="cursor-pointer gap-2"
            >
              <Zap className="size-3.5 text-primary" />
              <span className="text-sm">{action.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="AI copilot">
          <CommandItem
            value="ask the operations copilot chat ai"
            onSelect={() => go("/chat")}
            className="cursor-pointer gap-2"
          >
            <Bot className="size-3.5 text-muted-foreground" />
            <span className="text-sm">Open AI chat workspace</span>
          </CommandItem>
          <CommandItem
            value="hero ai chat workspace"
            onSelect={() => go("/vision")}
            className="cursor-pointer gap-2"
          >
            <Sparkles className="size-3.5 text-muted-foreground" />
            <span className="text-sm">Analyse an inspection image</span>
          </CommandItem>
        </CommandGroup>

        {recentSearches.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent knowledge searches">
              {recentSearches.slice(0, 5).map((query) => (
                <CommandItem
                  key={query}
                  value={`recent ${query}`}
                  onSelect={() => {
                    pushRecentSearch(query);
                    go(`/knowledge?q=${encodeURIComponent(query)}`);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Clock className="size-3.5 text-muted-foreground" />
                  <span className="truncate text-sm">{query}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Tip">
          <CommandItem
            value="navigation hint keyboard shortcut"
            onSelect={() => setOpen(false)}
            className="cursor-pointer gap-2"
          >
            <Navigation className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Press Ctrl / ⌘ + K anywhere in the workstation to reopen this palette.
            </span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
