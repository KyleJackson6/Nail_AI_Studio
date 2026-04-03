"use client";

import { useState, useEffect } from "react";
import NailLoader from "@/app/components/NailLoader";

type NailIdea = {
  id?: string;
  title: string;
  description: string;
  colorsUsed: string[];
  shape: string;
  length: string;
  imagePrompt?: string;
  savedImage?: string | null;
};

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [ideas, setIdeas] = useState<NailIdea[]>([]);
  const [colors, setColors] = useState([
    "Soft Pink",
    "White",
    "Nude",
    "Baby Blue",
  ]);
  const [newColor, setNewColor] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedIdeaForImage, setSelectedIdeaForImage] = useState<NailIdea | null>(null);

  const [selectedShape, setSelectedShape] = useState("Almond");
  const [selectedLength, setSelectedLength] = useState("Medium");

  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<NailIdea[]>([]);
  const [activeTab, setActiveTab] = useState<"design" | "ideas" | "chat" | "saved">("design");

  useEffect(() => {
    try {
      const savedColors = localStorage.getItem("nail_colors");
      const savedShape = localStorage.getItem("nail_shape");
      const savedLength = localStorage.getItem("nail_length");
      const savedDesignsData = localStorage.getItem("saved_nail_designs");

      if (savedColors) {
        try {
          const parsed = JSON.parse(savedColors);
          if (Array.isArray(parsed)) {
            setColors(parsed);
          }
        } catch {
          console.error("Failed to parse saved colors.");
        }
      }

      if (savedShape) {
        setSelectedShape(savedShape);
      }

      if (savedLength) {
        setSelectedLength(savedLength);
      }

      if (savedDesignsData) {
        try {
          const parsed = JSON.parse(savedDesignsData);
          if (Array.isArray(parsed)) {
            setSavedDesigns(parsed);
          }
        } catch {
          console.error("Failed to parse saved designs.");
        }
      }
    } catch (err) {
      console.error("Failed to load saved preferences:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nail_colors", JSON.stringify(colors));
  }, [colors]);

  useEffect(() => {
    localStorage.setItem("nail_shape", selectedShape);
  }, [selectedShape]);

  useEffect(() => {
    localStorage.setItem("nail_length", selectedLength);
  }, [selectedLength]);

  useEffect(() => {
    localStorage.setItem("saved_nail_designs", JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  const shapes = ["Almond", "Square", "Coffin", "Oval", "Stiletto", "Round"];
  const lengths = ["Short", "Medium", "Long"];

  const resetPreferences = () => {
    localStorage.removeItem("nail_colors");
    localStorage.removeItem("nail_shape");
    localStorage.removeItem("nail_length");

    setColors(["Soft Pink", "White", "Nude", "Baby Blue"]);
    setSelectedShape("Almond");
    setSelectedLength("Medium");
  };

  const saveDesign = (idea: NailIdea) => {
    const designToSave: NailIdea = {
      ...idea,
      id: idea.id || `${idea.title}-${Date.now()}`,
      savedImage:
        selectedIdeaForImage &&
          selectedIdeaForImage.title === idea.title &&
          selectedIdeaForImage.description === idea.description
          ? generatedImage
          : idea.savedImage || null,
    };

    const alreadySaved = savedDesigns.some(
      (design) =>
        design.title === idea.title &&
        design.description === idea.description &&
        design.shape === idea.shape &&
        design.length === idea.length
    );

    if (alreadySaved) {
      alert("This design is already saved.");
      return;
    }

    setSavedDesigns((prev) => [designToSave, ...prev]);
  };

  const removeSavedDesign = (id?: string) => {
    setSavedDesigns((prev) => prev.filter((design) => design.id !== id));
  };

  const saveImageToPhone = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "nail-design.png", { type: blob.type });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Nail Design",
          text: "Saved from Gabby's AI Nail Studio",
        });
        return;
      }

      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "nail-design.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to save image:", error);
      alert("Could not save the image.");
    }
  };

  const handleGenerateIdeas = async () => {
    try {
      setLoadingIdeas(true);

      const res = await fetch("/api/designs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          colors,
          shape: selectedShape,
          length: selectedLength,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not generate nail ideas.");
        return;
      }

      setIdeas(data.ideas || []);
      setActiveTab("ideas");
    } catch (error) {
      console.error("Error generating ideas:", error);
      alert("Something went wrong while generating ideas.");
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleAskChatbot = async () => {
    try {
      setLoadingChat(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: chatMessage,
          colors,
          shape: selectedShape,
          length: selectedLength,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not get chatbot reply.");
        return;
      }

      setChatReply(data.reply || "");
    } catch (error) {
      console.error("Error asking chatbot:", error);
      alert("Something went wrong while asking the chatbot.");
    } finally {
      setLoadingChat(false);
    }
  };

  const handleGenerateImage = async (idea: NailIdea) => {
    try {
      setLoadingImage(true);
      setSelectedIdeaForImage(idea);

      const res = await fetch("/api/image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `${idea.title}. ${idea.description}. Colors: ${idea.colorsUsed.join(
            ", "
          )}. Shape: ${idea.shape}. Length: ${idea.length}. Create a realistic luxury nail inspiration photo with a clean beauty background.`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not generate image.");
        return;
      }

      if (data.imageBase64) {
        setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Something went wrong while generating the image.");
    } finally {
      setLoadingImage(false);
    }
  };

  const addColor = () => {
    const trimmed = newColor.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
      setNewColor("");
    }
  };

  const removeColor = (colorToRemove: string) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const formatChatReply = (text: string) => {
    return text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line, index) => (
        <p key={index} className="leading-7 text-white/85">
          {line}
        </p>
      ));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_30%),linear-gradient(135deg,#05060a_0%,#11131a_45%,#2a0d19_100%)] text-white px-4 sm:px-6 py-8 sm:py-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="hidden md:block space-y-8">
          <section className="text-center space-y-4">
            <div className="inline-block rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-1 text-sm text-pink-200 shadow-lg">
              Custom AI Nail Inspiration
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Gabby’s AI Nail Studio
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg">
              Generate nail inspiration, explore color ideas, preview looks, and ask nail questions in one beautiful workspace.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            <div className="xl:col-span-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
              <h2 className="text-2xl font-semibold">Design Generator</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: classy birthday nails with soft pink and subtle sparkle"
                className="w-full min-h-36 rounded-2xl bg-black/20 border border-white/10 p-4 outline-none focus:border-pink-400/50 transition"
              />
              <button
                onClick={handleGenerateIdeas}
                disabled={loadingIdeas}
                className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {loadingIdeas ? "Generating..." : "Generate Ideas"}
              </button>
            </div>

            <div className="xl:col-span-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
              <h2 className="text-2xl font-semibold">Available Nail Colors</h2>

              <div className="flex gap-2">
                <input
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  placeholder="Add a color"
                  className="flex-1 rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                />
                <button
                  onClick={addColor}
                  className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/20 transition"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <div
                    key={color}
                    className="flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-500/15 px-3 py-2 text-sm text-pink-100"
                  >
                    <span>{color}</span>
                    <button
                      onClick={() => removeColor(color)}
                      className="text-white/60 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
              <h2 className="text-2xl font-semibold">Design Details</h2>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Nail Shape</label>
                <select
                  value={selectedShape}
                  onChange={(e) => setSelectedShape(e.target.value)}
                  className="w-full rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                >
                  {shapes.map((shape) => (
                    <option key={shape} value={shape} className="bg-neutral-900">
                      {shape}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/70">Nail Length</label>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="w-full rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                >
                  {lengths.map((length) => (
                    <option key={length} value={length} className="bg-neutral-900">
                      {length}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/65">
                The AI will now use your selected shape and length when creating designs and answering questions.
              </div>

              <button
                onClick={resetPreferences}
                className="w-full rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition text-sm"
              >
                Reset Saved Preferences
              </button>
            </div>
          </section>

          <section className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Generated Nail Ideas</h2>
                <span className="text-sm text-white/50">
                  {ideas.length} idea{ideas.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="space-y-4 max-h-[500px] sm:max-h-[700px] overflow-y-auto pr-1">
                {ideas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
                    Your generated nail ideas will appear here.
                  </div>
                ) : (
                  ideas.map((idea, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">{idea.title}</h3>
                        <p className="mt-2 text-white/75 leading-7">{idea.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm">
                        {idea.colorsUsed.map((color) => (
                          <span
                            key={color}
                            className="rounded-full bg-white/8 px-3 py-1 text-white/75"
                          >
                            {color}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <span>Shape: {idea.shape}</span>
                        <span>Length: {idea.length}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleGenerateImage(idea)}
                          disabled={loadingImage}
                          className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 transition disabled:opacity-50"
                        >
                          {loadingImage ? "Painting nails..." : "Preview Example"}
                        </button>

                        <button
                          onClick={() => saveDesign(idea)}
                          className="rounded-xl bg-pink-500/20 px-4 py-2 hover:bg-pink-500/30 transition"
                        >
                          Save Design
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <h2 className="text-2xl font-semibold mb-4">Example Photo</h2>

              {loadingImage ? (
                <div className="min-h-[300px] sm:min-h-[520px] flex items-center justify-center">
                  <NailLoader />
                </div>
              ) : generatedImage ? (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated nail design"
                    className="w-full rounded-3xl border border-white/10 object-cover"
                  />

                  <button
                    onClick={() => saveImageToPhone(generatedImage)}
                    className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition"
                  >
                    Save Photo to Phone
                  </button>
                </div>
              ) : (
                <div className="min-h-[300px] sm:min-h-[520px] rounded-3xl border border-dashed border-white/15 flex items-center justify-center text-white/45 text-center p-6 bg-black/15">
                  Select a design and generate a preview image here.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Saved Designs</h2>
              <span className="text-sm text-white/50">
                {savedDesigns.length} saved
              </span>
            </div>

            {savedDesigns.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
                Saved nail designs will appear here.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {savedDesigns.map((design) => (
                  <div
                    key={design.id}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3"
                  >
                    {design.savedImage ? (
                      <img
                        src={design.savedImage}
                        alt={design.title}
                        className="w-full h-48 object-cover rounded-2xl border border-white/10"
                      />
                    ) : (
                      <div className="h-48 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/35 text-sm text-center p-4">
                        No saved image for this design
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold">{design.title}</h3>
                      <p className="text-sm text-white/70 mt-1">{design.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {design.colorsUsed.map((color) => (
                        <span
                          key={color}
                          className="rounded-full bg-white/8 px-3 py-1 text-white/75"
                        >
                          {color}
                        </span>
                      ))}
                    </div>

                    <div className="text-sm text-white/55">
                      Shape: {design.shape} | Length: {design.length}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {design.savedImage && (
                        <button
                          onClick={() => saveImageToPhone(design.savedImage!)}
                          className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 transition text-sm"
                        >
                          Save Photo
                        </button>
                      )}

                      <button
                        onClick={() => removeSavedDesign(design.id)}
                        className="rounded-xl bg-red-500/15 px-3 py-2 hover:bg-red-500/25 transition text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">Nail Chatbot</h2>
                <p className="text-white/60 mt-1">
                  Ask for style ideas, birthday looks, seasonal sets, or color combinations.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-white/60">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Shape: {selectedShape}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  Length: {selectedLength}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4 space-y-4">
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Ask something like: what birthday nail design should I do with soft pink and white?"
                className="w-full min-h-28 rounded-2xl bg-black/20 border border-white/10 p-4 outline-none focus:border-purple-400/50 transition"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-white/45">
                  The chatbot will use your selected colors, shape, and nail length.
                </div>

                <button
                  onClick={handleAskChatbot}
                  disabled={loadingChat}
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingChat ? "Thinking..." : "Ask Chatbot"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-fuchsia-500/10 p-5">
              {chatReply ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 font-bold">
                      AI
                    </div>
                    <div>
                      <p className="font-semibold">Gabby’s Nail Assistant</p>
                      <p className="text-sm text-white/50">Personalized reply</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-[15px]">
                    {formatChatReply(chatReply)}
                  </div>
                </div>
              ) : (
                <div className="text-white/45">
                  Your chatbot reply will appear.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:hidden space-y-6">
          <section className="text-center space-y-4">
            <div className="inline-block rounded-full border border-pink-400/20 bg-pink-400/10 px-4 py-1 text-sm text-pink-200 shadow-lg">
              Custom AI Nail Inspiration
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Gabby’s AI Nail Studio
            </h1>
            <p className="text-white/70 max-w-md mx-auto text-base px-2">
              Generate nail inspiration, explore color ideas, preview looks, and ask nail questions in one beautiful workspace.
            </p>
          </section>

          {activeTab === "design" && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
                <h2 className="text-2xl font-semibold">Design Generator</h2>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: classy birthday nails with soft pink and subtle sparkle"
                  className="w-full min-h-32 rounded-2xl bg-black/20 border border-white/10 p-4 outline-none focus:border-pink-400/50 transition"
                />
                <button
                  onClick={handleGenerateIdeas}
                  disabled={loadingIdeas}
                  className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingIdeas ? "Generating..." : "Generate Ideas"}
                </button>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
                <h2 className="text-2xl font-semibold">Available Nail Colors</h2>

                <div className="flex gap-2">
                  <input
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    placeholder="Add a color"
                    className="flex-1 rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                  />
                  <button
                    onClick={addColor}
                    className="rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/20 transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <div
                      key={color}
                      className="flex items-center gap-2 rounded-full border border-pink-300/20 bg-pink-500/15 px-3 py-2 text-sm text-pink-100"
                    >
                      <span>{color}</span>
                      <button
                        onClick={() => removeColor(color)}
                        className="text-white/60 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-4">
                <h2 className="text-2xl font-semibold">Design Details</h2>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Nail Shape</label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                  >
                    {shapes.map((shape) => (
                      <option key={shape} value={shape} className="bg-neutral-900">
                        {shape}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70">Nail Length</label>
                  <select
                    value={selectedLength}
                    onChange={(e) => setSelectedLength(e.target.value)}
                    className="w-full rounded-2xl bg-black/20 border border-white/10 p-3 outline-none focus:border-pink-400/50 transition"
                  >
                    {lengths.map((length) => (
                      <option key={length} value={length} className="bg-neutral-900">
                        {length}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={resetPreferences}
                  className="w-full rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20 transition text-sm"
                >
                  Reset Saved Preferences
                </button>
              </section>
            </div>
          )}

          {activeTab === "ideas" && (
            <div className="space-y-6">
              <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">Generated Nail Ideas</h2>
                  <span className="text-sm text-white/50">
                    {ideas.length} idea{ideas.length === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="space-y-4">
                  {ideas.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
                      Your generated nail ideas will appear here.
                    </div>
                  ) : (
                    ideas.map((idea, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3"
                      >
                        <div>
                          <h3 className="text-xl font-semibold">{idea.title}</h3>
                          <p className="mt-2 text-white/75 leading-7">{idea.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 text-sm">
                          {idea.colorsUsed.map((color) => (
                            <span
                              key={color}
                              className="rounded-full bg-white/8 px-3 py-1 text-white/75"
                            >
                              {color}
                            </span>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
                          <span>Shape: {idea.shape}</span>
                          <span>Length: {idea.length}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleGenerateImage(idea)}
                            disabled={loadingImage}
                            className="rounded-xl bg-white/10 px-4 py-2 hover:bg-white/20 transition disabled:opacity-50"
                          >
                            {loadingImage ? "Painting nails..." : "Preview Example"}
                          </button>

                          <button
                            onClick={() => saveDesign(idea)}
                            className="rounded-xl bg-pink-500/20 px-4 py-2 hover:bg-pink-500/30 transition"
                          >
                            Save Design
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
                <h2 className="text-2xl font-semibold mb-4">Example Photo</h2>

                {loadingImage ? (
                  <div className="min-h-[300px] flex items-center justify-center">
                    <NailLoader />
                  </div>
                ) : generatedImage ? (
                  <div className="space-y-4">
                    <img
                      src={generatedImage}
                      alt="Generated nail design"
                      className="w-full rounded-3xl border border-white/10 object-cover"
                    />

                    <button
                      onClick={() => saveImageToPhone(generatedImage)}
                      className="w-full rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition"
                    >
                      Save Photo to Phone
                    </button>
                  </div>
                ) : (
                  <div className="min-h-[300px] rounded-3xl border border-dashed border-white/15 flex items-center justify-center text-white/45 text-center p-6 bg-black/15">
                    Select a design and generate a preview image here.
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "chat" && (
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] space-y-5">
              <div>
                <h2 className="text-2xl font-semibold">Nail Chatbot</h2>
                <p className="text-white/60 mt-1">
                  Ask for style ideas, birthday looks, seasonal sets, or color combinations.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4 space-y-4">
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask something like: what birthday nail design should I do with soft pink and white?"
                  className="w-full min-h-28 rounded-2xl bg-black/20 border border-white/10 p-4 outline-none focus:border-purple-400/50 transition"
                />

                <button
                  onClick={handleAskChatbot}
                  disabled={loadingChat}
                  className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-semibold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loadingChat ? "Thinking..." : "Ask Chatbot"}
                </button>
              </div>

              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-fuchsia-500/10 p-5">
                {chatReply ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-violet-500 font-bold">
                        AI
                      </div>
                      <div>
                        <p className="font-semibold">Gabby’s Nail Assistant</p>
                        <p className="text-sm text-white/50">Personalized reply</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-[15px]">
                      {formatChatReply(chatReply)}
                    </div>
                  </div>
                ) : (
                  <div className="text-white/45">
                    Your chatbot reply will appear.
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "saved" && (
            <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Saved Designs</h2>
                <span className="text-sm text-white/50">
                  {savedDesigns.length} saved
                </span>
              </div>

              {savedDesigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/45">
                  Saved nail designs will appear here.
                </div>
              ) : (
                <div className="space-y-4">
                  {savedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3"
                    >
                      {design.savedImage ? (
                        <img
                          src={design.savedImage}
                          alt={design.title}
                          className="w-full h-48 object-cover rounded-2xl border border-white/10"
                        />
                      ) : (
                        <div className="h-48 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/35 text-sm text-center p-4">
                          No saved image for this design
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold">{design.title}</h3>
                        <p className="text-sm text-white/70 mt-1">{design.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {design.colorsUsed.map((color) => (
                          <span
                            key={color}
                            className="rounded-full bg-white/8 px-3 py-1 text-white/75"
                          >
                            {color}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm text-white/55">
                        Shape: {design.shape} | Length: {design.length}
                      </div>

                      <div className="flex flex-col gap-2">
                        {design.savedImage && (
                          <button
                            onClick={() => saveImageToPhone(design.savedImage!)}
                            className="rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 transition text-sm"
                          >
                            Save Photo
                          </button>
                        )}

                        <button
                          onClick={() => removeSavedDesign(design.id)}
                          className="rounded-xl bg-red-500/15 px-3 py-2 hover:bg-red-500/25 transition text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/80 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setActiveTab("design")}
            className={`rounded-xl px-3 py-2 text-xs ${activeTab === "design" ? "bg-pink-500/30 text-white" : "text-white/60"
              }`}
          >
            Design
          </button>

          <button
            onClick={() => setActiveTab("ideas")}
            className={`rounded-xl px-3 py-2 text-xs ${activeTab === "ideas" ? "bg-pink-500/30 text-white" : "text-white/60"
              }`}
          >
            Ideas
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`rounded-xl px-3 py-2 text-xs ${activeTab === "chat" ? "bg-pink-500/30 text-white" : "text-white/60"
              }`}
          >
            Chat
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`rounded-xl px-3 py-2 text-xs ${activeTab === "saved" ? "bg-pink-500/30 text-white" : "text-white/60"
              }`}
          >
            Saved
          </button>
        </div>
      </div>
    </main>
  );
}