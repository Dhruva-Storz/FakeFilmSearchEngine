import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchEngineConfig, SearchResult, Sitelink } from '../types/schema';
import { defaultConfig } from '../data/defaultSchema';

interface Props {
  config: SearchEngineConfig;
  setConfig: (c: SearchEngineConfig) => void;
}

// ── Colour tokens (DaVinci-inspired film grade palette) ───────────────────
const C = {
  bg:        '#0E0E10',
  surface:   '#18181B',
  raised:    '#222226',
  border:    '#2E2E34',
  borderHi:  '#45454E',
  text:      '#E4E4E8',
  muted:     '#76767E',
  amber:     '#F0A500',
  amberDim:  'rgba(240,165,0,0.12)',
  amberBorder:'rgba(240,165,0,0.35)',
  green:     '#3DD68C',
  red:       '#F06060',
  inputBg:   '#111114',
};

// ── LLM boilerplate prompt ─────────────────────────────────────────────────
function buildPrompt(engineName: string, tagline: string): string {
  return `You are helping a film or TV production set up a fake search engine prop. Your job is to collaboratively build a set of convincing fake search results with the filmmaker — asking only what you genuinely need to know, and nothing more.

Start with these two questions, asked together in a friendly, conversational way:

- Briefly describe the scene: what's happening, and what is the character looking up?
- What is the exact search term the actor will type into the search bar?

Then, based on their answers, ask only the follow-up questions that are actually relevant. Do not ask questions you can answer yourself from context. The only follow-up topics that matter are:

- Does the actor need to click on any result and be taken to a real page? If yes, what URL should it open?
- What language should the results be in? (Only ask if it's not obvious from the scenario.)
- Is there anything specific that must appear — a particular name, headline, organisation, or piece of information?

Do not ask about genre, tone, time period, or anything else you can reasonably infer. Do not make the filmmaker fill out a form — have a conversation.

Once you have everything you need, output ONLY the following JSON with no explanation, no markdown, no commentary — just the raw object:

{
  "engineName": "${engineName}",
  "tagline": "${tagline}",
  "results": [
    {
      "title": "Headline-style title of the result",
      "displayUrl": "www.example.com/realistic-path",
      "url": null,
      "description": "2–3 sentences of snippet text. Specific, plausible, and grounded in the details the filmmaker gave you.",
      "sitelinks": null
    }
  ]
}

Rules for generating results:
- Exactly 10 results
- Mix result types naturally — news articles, official organisations, databases, registries, profiles, company pages, court records — whatever fits the specific scenario
- URLs must look authentic: real-sounding domains with specific paths, not placeholders
- Descriptions must be detailed and grounded — no vague filler
- Add "sitelinks" (array of {"text": "Label", "url": null}) sparingly — 2 or 3 results at most, only where it looks natural
- Set "url" to null unless the filmmaker asked for a real clickable link; if they did, use the exact URL they specified
- Output the JSON object only — nothing else`;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function EditPage({ config, setConfig }: Props) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Step 1 handlers ──────────────────────────────────────────────────────
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setConfig({ ...config, logoDataUrl: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removeLogo() {
    setConfig({ ...config, logoDataUrl: undefined });
  }

  // ── Step 2 handlers ──────────────────────────────────────────────────────
  function copyPrompt() {
    navigator.clipboard.writeText(buildPrompt(config.engineName, config.tagline)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function applyPasted() {
    setPasteError('');
    setPasteSuccess(false);

    // Extract the outermost {...} block so users can paste the whole AI conversation
    const start = pastedJson.indexOf('{');
    const end = pastedJson.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      setPasteError('No data found. Make sure you copied the AI\'s final response — it should start with { and end with }.');
      return;
    }
    const jsonSlice = pastedJson.slice(start, end + 1);

    try {
      const parsed = JSON.parse(jsonSlice) as Partial<SearchEngineConfig>;
      if (!Array.isArray(parsed.results) || parsed.results.length === 0) {
        setPasteError('Found some data but no search results inside it. Try copying the AI\'s response again from the very beginning of the { to the final }.');
        return;
      }
      setConfig({
        ...config,
        ...(parsed.engineName ? { engineName: parsed.engineName } : {}),
        ...(parsed.tagline ? { tagline: parsed.tagline } : {}),
        results: parsed.results,
      });
      setPastedJson('');
      setPasteSuccess(true);
      setTimeout(() => setPasteSuccess(false), 3000);
    } catch {
      setPasteError('The data looks almost right but has a formatting error. Try asking the AI to output it again — it should be a single block starting with { and ending with }.');
    }
  }

  // ── Advanced editor helpers ──────────────────────────────────────────────
  function updateResult(index: number, updated: SearchResult) {
    const results = config.results.map((r, i) => (i === index ? updated : r));
    setConfig({ ...config, results });
  }
  function removeResult(index: number) {
    setConfig({ ...config, results: config.results.filter((_, i) => i !== index) });
  }
  function moveResult(index: number, dir: -1 | 1) {
    const results = [...config.results];
    const t = index + dir;
    if (t < 0 || t >= results.length) return;
    [results[index], results[t]] = [results[t], results[index]];
    setConfig({ ...config, results });
  }
  function addResult() {
    setConfig({
      ...config,
      results: [...config.results, { title: 'New Result', displayUrl: 'www.example.com', description: 'Description.' }],
    });
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8,
    color: C.text, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: C.muted, marginBottom: 6,
  };
  const cardStyle: React.CSSProperties = {
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: 12, padding: '24px 28px', marginBottom: 16,
  };
  const stepNumStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: '50%', background: C.amberDim,
    border: `1px solid ${C.amberBorder}`, color: C.amber,
    fontSize: 12, fontWeight: 700, marginRight: 10, flexShrink: 0,
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header style={{ borderBottom: `1px solid ${C.border}`, background: C.surface, position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="edit-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>🎬</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Fake Search Engine</div>
              <div className="edit-header-title" style={{ fontSize: 11, color: C.muted }}>Production Configuration</div>
            </div>
          </div>
          <button
            onClick={() => navigate('/search', { replace: true })}
            style={{ background: C.amber, color: '#000', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' }}
          >
            Launch Simulation →
          </button>
        </div>
      </header>

      <div className="edit-content">

        {/* ── Hero blurb ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Set up your fake search engine
          </h1>
          <p style={{ fontSize: 14, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Configure what actors see on screen. No coding required — just fill in three steps below.
            Your settings are saved automatically in the browser.
          </p>
        </div>

        {/* ── STEP 1: Identity ────────────────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={stepNumStyle}>1</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Name your search engine</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>This is what appears in the browser and on screen.</div>
            </div>
          </div>

          <div className="edit-two-col">
            <div>
              <label style={labelStyle}>Engine name</label>
              <input
                style={inputStyle}
                value={config.engineName}
                onChange={e => setConfig({ ...config, engineName: e.target.value })}
                placeholder="e.g. Searcher, Nexus, Orion…"
              />
            </div>
            <div>
              <label style={labelStyle}>Tagline <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <input
                style={inputStyle}
                value={config.tagline}
                onChange={e => setConfig({ ...config, tagline: e.target.value })}
                placeholder="e.g. Search for anything, privately and securely."
              />
            </div>
          </div>

          {/* Logo upload */}
          <label style={labelStyle}>Logo <span style={{ color: C.muted, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — PNG or SVG recommended)</span></label>
          {config.logoDataUrl ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', background: C.raised, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <img src={config.logoDataUrl} alt="Logo preview" style={{ height: 40, objectFit: 'contain' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.text }}>Logo uploaded</div>
                <div style={{ fontSize: 11, color: C.muted }}>Stored in browser — no file needed on the server.</div>
              </div>
              <button
                onClick={removeLogo}
                style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', color: C.muted, fontSize: 12, cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => logoInputRef.current?.click()}
              style={{ width: '100%', padding: '20px', background: C.raised, border: `1.5px dashed ${C.borderHi}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: 'pointer', textAlign: 'center' as const }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>⬆</div>
              Click to upload a logo image
            </button>
          )}
          <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
        </div>

        {/* ── STEP 2: Generate results ─────────────────────────────── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={stepNumStyle}>2</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>Generate your search results with AI</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Copy the prompt below into ChatGPT, Claude, or any AI chatbot. Answer its questions, then paste the result back here.</div>
            </div>
          </div>

          {/* Instruction steps */}
          <div className="edit-steps-abc">
            {[
              { n: 'A', text: 'Copy the prompt' },
              { n: 'B', text: 'Paste into an AI & answer its questions' },
              { n: 'C', text: 'Copy the AI\'s response & paste below' },
            ].map((step, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 8, padding: '0 12px 0 0' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: C.raised, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: C.amber, flexShrink: 0 }}>{step.n}</div>
                <span style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{step.text}</span>
              </div>
            ))}
          </div>

          {/* Prompt box */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ padding: '14px 16px', background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 8, maxHeight: 160, overflowY: 'auto', overflowX: 'hidden', fontSize: 12, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              {buildPrompt(config.engineName, config.tagline)}
            </div>
            <button
              onClick={copyPrompt}
              style={{
                position: 'absolute', top: 10, right: 10,
                background: copied ? C.green : C.amberDim,
                border: `1px solid ${copied ? C.green : C.amberBorder}`,
                borderRadius: 6, padding: '5px 12px',
                color: copied ? '#000' : C.amber,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy prompt'}
            </button>
          </div>

          {/* Paste area */}
          <label style={labelStyle}>Paste the AI's response here</label>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px', lineHeight: 1.6 }}>
            When the AI is done asking questions it will output a block of data. It will look something like this:
          </p>
          <div style={{ position: 'relative', padding: '10px 14px 10px', background: 'transparent', border: `1px dashed ${C.borderHi}`, borderRadius: 6, fontSize: 11, color: C.muted, fontFamily: 'monospace', marginBottom: 10, lineHeight: 1.7, opacity: 0.7 }}>
            <span style={{ position: 'absolute', top: -9, left: 10, background: C.surface, padding: '0 6px', fontSize: 10, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif' }}>example</span>
            {'{'}<br />
            &nbsp;&nbsp;"engineName": "Search",<br />
            &nbsp;&nbsp;"tagline": "Search for anything...",<br />
            &nbsp;&nbsp;"results": [ {'{'} "title": "...", "displayUrl": "...", ... {'}'}, ... ]<br />
            {'}'}
          </div>
          <p style={{ fontSize: 12, color: C.muted, margin: '0 0 8px' }}>
            Copy everything from the <span style={{ color: C.text, fontFamily: 'monospace' }}>{`{`}</span> at the start to the <span style={{ color: C.text, fontFamily: 'monospace' }}>{`}`}</span> at the end, then paste it below. You can even paste the whole conversation — we'll find the data automatically.
          </p>
          <textarea
            value={pastedJson}
            onChange={e => { setPastedJson(e.target.value); setPasteError(''); setPasteSuccess(false); }}
            placeholder="Paste here…"
            style={{ ...inputStyle, height: 120, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 } as React.CSSProperties}
          />
          {pasteError && (
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(240,96,96,0.1)', border: '1px solid rgba(240,96,96,0.3)', borderRadius: 6, fontSize: 12, color: C.red }}>
              {pasteError}
            </div>
          )}
          {pasteSuccess && (
            <div style={{ marginTop: 8, padding: '10px 14px', background: 'rgba(61,214,140,0.1)', border: '1px solid rgba(61,214,140,0.3)', borderRadius: 6, fontSize: 12, color: C.green }}>
              ✓ Results applied successfully! Click "Launch Simulation" to see them.
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
            <button
              onClick={applyPasted}
              disabled={!pastedJson.trim()}
              style={{
                background: pastedJson.trim() ? C.amber : C.raised,
                color: pastedJson.trim() ? '#000' : C.muted,
                border: 'none', borderRadius: 8, padding: '10px 22px',
                fontSize: 13, fontWeight: 700, cursor: pastedJson.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              Apply Results
            </button>
          </div>
        </div>

        {/* ── STEP 3: Advanced / visual editor ────────────────────── */}
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <button
            onClick={() => setAdvancedOpen(v => !v)}
            style={{ width: '100%', padding: '16px 24px', background: C.surface, border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={stepNumStyle}>3</span>
              <div style={{ textAlign: 'left' as const }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Advanced — edit results manually</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Fine-tune individual results, reorder, add or remove entries.</div>
              </div>
            </div>
            <span style={{ fontSize: 16, color: C.muted, transition: 'transform 0.2s', transform: advancedOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>

          {advancedOpen && (
            <div style={{ padding: '0 24px 24px', background: C.surface, borderTop: `1px solid ${C.border}` }}>
              <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {config.results.map((result, i) => (
                  <AdvancedResultCard
                    key={i}
                    index={i}
                    total={config.results.length}
                    result={result}
                    onChange={r => updateResult(i, r)}
                    onRemove={() => removeResult(i)}
                    onMove={dir => moveResult(i, dir)}
                  />
                ))}
                <button
                  onClick={addResult}
                  style={{ padding: '14px', background: 'none', border: `1.5px dashed ${C.borderHi}`, borderRadius: 8, color: C.muted, fontSize: 13, cursor: 'pointer' }}
                >
                  + Add result
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                  <button
                    onClick={() => setConfig(defaultConfig)}
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reset to default data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Advanced result card ───────────────────────────────────────────────────
interface AdvancedResultCardProps {
  index: number;
  total: number;
  result: SearchResult;
  onChange: (r: SearchResult) => void;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
}

function AdvancedResultCard({ index, total, result, onChange, onRemove, onMove }: AdvancedResultCardProps) {
  const [open, setOpen] = useState(false);

  const inputStyle: React.CSSProperties = {
    flex: 1, background: '#111114', border: `1px solid ${C.border}`, borderRadius: 6,
    color: C.text, padding: '8px 12px', fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ background: C.raised, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ fontSize: 11, color: C.muted, width: 16, textAlign: 'center' }}>{index + 1}</span>
        <span style={{ flex: 1, fontSize: 13, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.title || 'Untitled'}</span>
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onMove(-1)} disabled={index === 0} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '2px 6px', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: '2px 6px', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
          <button onClick={onRemove} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', padding: '2px 6px' }}>✕</button>
        </div>
        <span style={{ color: C.muted, fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '0 14px 14px', borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 12 }}>
            <div className="edit-adv-row">
              <input style={inputStyle} value={result.title} onChange={e => onChange({ ...result, title: e.target.value })} placeholder="Title" />
            </div>
            <div className="edit-adv-row">
              <input style={inputStyle} value={result.displayUrl} onChange={e => onChange({ ...result, displayUrl: e.target.value })} placeholder="Display URL (e.g. www.example.com/path)" />
              <input style={inputStyle} value={result.url ?? ''} onChange={e => onChange({ ...result, url: e.target.value || undefined })} placeholder="Link URL (optional — leave blank)" />
            </div>
            <textarea
              value={result.description}
              onChange={e => onChange({ ...result, description: e.target.value })}
              placeholder="Description snippet"
              style={{ ...inputStyle, flex: 'unset', width: '100%', height: 72, resize: 'vertical', fontFamily: 'inherit', marginBottom: 10, boxSizing: 'border-box' } as React.CSSProperties}
            />
            {/* Sitelinks */}
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Sub-links (optional)</div>
            {(result.sitelinks ?? []).map((sl, j) => (
              <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={sl.text} onChange={e => { const sls = [...(result.sitelinks ?? [])]; sls[j] = { ...sl, text: e.target.value }; onChange({ ...result, sitelinks: sls }); }} placeholder="Label" />
                <input style={{ ...inputStyle, flex: 1 }} value={sl.url ?? ''} onChange={e => { const sls = [...(result.sitelinks ?? [])]; sls[j] = { ...sl, url: e.target.value || undefined }; onChange({ ...result, sitelinks: sls }); }} placeholder="Link (optional)" />
                <button onClick={() => onChange({ ...result, sitelinks: (result.sitelinks ?? []).filter((_, k) => k !== j) })} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', padding: '0 4px' }}>✕</button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...result, sitelinks: [...(result.sitelinks ?? []), { text: '' }] })}
              style={{ background: 'none', border: 'none', color: C.amber, fontSize: 12, cursor: 'pointer', padding: 0 }}
            >
              + Add sub-link
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Sitelink type used in inline handlers above
type _Sitelink = Sitelink;
void (0 as unknown as _Sitelink);
