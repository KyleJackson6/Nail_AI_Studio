"use client";

import { useEffect, useState } from "react";

type NailIdea = {
  title: string;
  description: string;
  colorsUsed: string[];
  shape: string;
  length: string;
  whyItFits: string;
  imagePrompt: string;
};

type Profile = {
  businessName?: string;
  ownerName?: string;
  tones?: string;
  colors: { name: string; hex?: string | null }[];
  shapes: { name: string }[];
  lengths: { name: string }[];
};

export default function HomePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [prompt, setPrompt] = useState("");
  const [ideas, setIdeas] = useState<NailIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  const generateIdeas = async () => {
    setLoading(true);
    setGeneratedImage(null);

    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setIdeas(data.ideas || []);
    setLoading(false);
  };

  const askChat = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: chatMessage }),
    });

    const data = await res.json();
    setChatReply(data.reply || "");
  };

  const generateImage = async (imagePrompt: string) => {
    setGeneratedImage(null);

    const res = await fetch("/api/image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagePrompt }),
    });

    const data = await res.json();

    if (data.imageBase64) {
      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-4xl font-bold mb-2">AI Nail Design Studio</h1>
          <p className="text-white/70">
            Generate nail ideas, preview looks, and ask nail questions.
          </p>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Design Generator</h2>
            <textarea
              className="w-full min-h-32 rounded-2xl bg-black/30 border border-white/10 p-4 outline-none"
              placeholder="Example: soft pink classy spring nails with flowers"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={generateIdeas}
              disabled={loading}
              className="px-5 py-3 rounded-2xl bg-pink-500 hover:bg-pink-400 transition font-medium"
            >
              {loading ? "Generating..." : "Generate Nail Ideas"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <h2 className="text-2xl font-semibold">Current Inventory</h2>
            <div>
              <p className="font-medium">Colors</p>
              <p className="text-white/70">
                {profile?.colors?.map((c) => c.name).join(", ") || "None yet"}
              </p>
            </div>
            <div>
              <p className="font-medium">Shapes</p>
              <p className="text-white/70">
                {profile?.shapes?.map((s) => s.name).join(", ") || "None yet"}
              </p>
            </div>
            <div>
              <p className="font-medium">Lengths</p>
              <p className="text-white/70">
                {profile?.lengths?.map((l) => l.name).join(", ") || "None yet"}
              </p>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Generated Ideas</h2>
            <div className="space-y-4">
              {ideas.map((idea, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2"
                >
                  <h3 className="text-xl font-semibold">{idea.title}</h3>
                  <p className="text-white/80">{idea.description}</p>
                  <p className="text-sm text-white/60">
                    Colors: {idea.colorsUsed.join(", ")}
                  </p>
                  <p className="text-sm text-white/60">
                    Shape: {idea.shape} | Length: {idea.length}
                  </p>
                  <p className="text-sm text-white/70">{idea.whyItFits}</p>
                  <button
                    onClick={() => generateImage(idea.imagePrompt)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                  >
                    Generate Example Photo
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-2xl font-semibold">Example Photo</h2>
            {generatedImage ? (
              <img
                src={generatedImage}
                alt="Generated nail example"
                className="rounded-2xl w-full"
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/50">
                Generate a design image to preview it here.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Nail Chatbot</h2>
          <textarea
            className="w-full min-h-24 rounded-2xl bg-black/30 border border-white/10 p-4 outline-none"
            placeholder="Ask anything about nails, colors, pricing, shapes, trends..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
          />
          <button
            onClick={askChat}
            className="px-5 py-3 rounded-2xl bg-purple-500 hover:bg-purple-400 transition font-medium"
          >
            Ask Chatbot
          </button>

          {chatReply && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 whitespace-pre-wrap text-white/80">
              {chatReply}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}