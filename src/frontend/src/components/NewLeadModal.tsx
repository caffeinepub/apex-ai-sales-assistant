import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateLead } from "../hooks/useQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

const empty = { name: "", email: "", company: "", phone: "", dealValue: "" };

export function NewLeadModal({ open, onClose }: Props) {
  const [form, setForm] = useState(empty);
  const createLead = useCreateLead();

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) {
      toast.error("Name, email, and company are required.");
      return;
    }
    try {
      await createLead.mutateAsync({
        name: form.name,
        email: form.email,
        company: form.company,
        phone: form.phone,
        dealValue: Number(form.dealValue) || 0,
      });
      toast.success("Lead created!");
      setForm(empty);
      onClose();
    } catch {
      toast.error("Failed to create lead");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="new_lead.dialog"
        className="bg-card border-border max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground">New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="lead-name"
              className="text-sm text-muted-foreground"
            >
              Full Name *
            </Label>
            <Input
              id="lead-name"
              data-ocid="new_lead.input"
              value={form.name}
              onChange={set("name")}
              placeholder="Sarah Johnson"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="lead-email"
              className="text-sm text-muted-foreground"
            >
              Email *
            </Label>
            <Input
              id="lead-email"
              data-ocid="new_lead.email_input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="sarah@acme.com"
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="lead-company"
              className="text-sm text-muted-foreground"
            >
              Company *
            </Label>
            <Input
              id="lead-company"
              data-ocid="new_lead.company_input"
              value={form.company}
              onChange={set("company")}
              placeholder="Acme Corp"
              className="bg-background border-border"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="lead-phone"
                className="text-sm text-muted-foreground"
              >
                Phone
              </Label>
              <Input
                id="lead-phone"
                data-ocid="new_lead.phone_input"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+1 555 000 1234"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="lead-value"
                className="text-sm text-muted-foreground"
              >
                Deal Value ($)
              </Label>
              <Input
                id="lead-value"
                data-ocid="new_lead.deal_value_input"
                type="number"
                value={form.dealValue}
                onChange={set("dealValue")}
                placeholder="10000"
                className="bg-background border-border"
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              data-ocid="new_lead.cancel_button"
              onClick={onClose}
              disabled={createLead.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="new_lead.submit_button"
              disabled={createLead.isPending}
            >
              {createLead.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
