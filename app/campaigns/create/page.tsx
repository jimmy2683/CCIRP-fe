"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, Template } from "@/libs/api";
import { useAuth } from "@/components/providers/AuthProvider";

export default function CreateCampaignWizard() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Wizard Data State
  const [campaignName, setCampaignName] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [recipients, setRecipients] = useState(""); // comma separated emails for simplicity
  
  // Available Templates
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    // Fetch templates when wizard loads
    const fetchTemplates = async () => {
      try {
        const tpls = await api.templates.list();
        setTemplates(tpls);
      } catch (err) {
        console.error("Failed to load templates", err);
      }
    };
    fetchTemplates();
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const recipientList = recipients.split(",").map(e => e.trim()).filter(e => e);
      
      await api.campaigns.create({
        name: campaignName,
        subject: subject,
        template_id: selectedTemplate?._id || "",
        recipients: recipientList,
        scheduled_at: new Date().toISOString() // Sending immediately for this MVP
      });
      
      // Redirect on success
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent mb-8">
          Campaign Wizard
        </h1>

        {/* Stepper HUD */}
        <div className="flex space-x-4 mb-8">
          {["Details", "Template", "Audience", "Review"].map((label, idx) => (
            <div key={label} className={`flex-1 border-b-2 pb-2 transition-all ${step >= idx + 1 ? 'border-primary text-primary' : 'border-border text-muted-foreground'}`}>
              <span className="text-sm font-semibold tracking-wide uppercase">Step {idx + 1}</span>
              <p className="text-lg">{label}</p>
            </div>
          ))}
        </div>

        {/* Wizard Container - Glassmorphism */}
        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl min-h-[400px]">
          
          {error && <div className="mb-6 bg-destructive/20 border border-destructive/50 text-destructive p-4 rounded-xl">{error}</div>}

          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Campaign Details</h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
                  placeholder="E.g., Spring Promo 2026"
                />
              </div>
               <div>
                <label className="block text-sm text-muted-foreground mb-2">Message Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-muted border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary transition-all outline-none"
                  placeholder="Subject line for emails"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Template Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Select Template</h2>
              <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {templates.map(tpl => (
                  <div 
                    key={tpl._id} 
                    onClick={() => setSelectedTemplate(tpl)}
                    className={`cursor-pointer border rounded-xl p-4 transition-all ${selectedTemplate?._id === tpl._id ? 'bg-primary/20 border-primary focus:ring-2 ring-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]' : 'bg-muted border-border hover:border-accent hover:bg-accent/50'}`}
                  >
                    <h3 className="text-lg font-medium text-foreground">{tpl.name}</h3>
                    <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                      <span>{tpl.channel.toUpperCase()}</span>
                      <span className="px-2 py-1 bg-background rounded border border-border">v{tpl.version}</span>
                    </div>
                  </div>
                ))}
                {templates.length === 0 && (
                  <p className="text-muted-foreground col-span-2 text-center py-8">No templates found. Go create one first!</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Audience */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Define Audience</h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Recipients (Comma separated emails)</label>
                <textarea 
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="w-full h-32 bg-muted border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary transition-all outline-none resize-none"
                  placeholder="user1@example.com, user2@example.com"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Review & Launch</h2>
              
              <div className="space-y-4 bg-muted/50 p-6 rounded-xl border border-border">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Campaign Name:</span>
                  <span className="font-medium">{campaignName || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Subject:</span>
                  <span className="font-medium">{subject || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="font-medium text-primary">{selectedTemplate?.name || "None Selected"}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Recipients Count:</span>
                  <span className="font-medium">{
                    recipients ? recipients.split(",").filter(e => e.trim()).length : 0
                  } users</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between mt-12 pt-6 border-t border-border">
            <button 
              onClick={handlePrev}
              disabled={step === 1 || loading}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${step === 1 ? 'opacity-0 cursor-default' : 'bg-muted hover:bg-accent text-foreground'}`}
            >
              Back
            </button>
            
            {step < 4 ? (
              <button 
                onClick={handleNext}
                disabled={
                  (step === 1 && !campaignName) || 
                  (step === 2 && !selectedTemplate) ||
                  (step === 3 && !recipients)
                }
                className="px-8 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Continue
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? "Launching..." : "Launch Campaign"}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
