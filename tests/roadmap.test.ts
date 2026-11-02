import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { site } from "../src/content/site";
import { renderExperience } from "../src/render/experience";
import { escapeHtml } from "../src/render/escape";
import { pathwayNodes, pillarAnchors, viewPoint } from "../src/viz/layout";

describe("site content", () => {
  it("keeps three stages, four pillars, and three tiers in official order", () => {
    assert.equal(site.journey.stages.length, 3);
    assert.equal(site.pillars.items.length, 4);
    assert.deepEqual(
      site.journey.stages.map((stage) => stage.name),
      ["Infrastructure", "Expansion", "Full implementation"],
    );
    assert.deepEqual(
      site.tiers.items.map((tier) => `${tier.number} ${tier.name}`),
      ["Tier 3 Universal support", "Tier 2 Targeted support", "Tier 1 Intensive support"],
    );
    assert.equal(site.team.groups.reduce((sum, group) => sum + group.people.length, 0), 10);
  });

  it("preserves published language and does not invent results", () => {
    const blob = JSON.stringify(site);
    assert.match(blob, /Analytics Integrator 2\.0/);
    assert.match(blob, /500 LEAD students/);
    assert.match(blob, /Tiers 1 and 2/);
    assert.match(blob, /broad institutional adoption/);
    assert.match(blob, /Sukhwant Jhaj/);
    assert.match(blob, /Curious about PROPEL/);
    assert.doesNotMatch(blob, /\d+%/);
    assert.doesNotMatch(blob, /retention increased|revenue|\$\d|completion rate/i);
    assert.equal(site.tiers.items[0]?.number, "Tier 3");
    assert.match(site.tiers.items[2]?.paragraphs.join(" ") ?? "", /one-on-one/);
  });
});

describe("render", () => {
  const html = renderExperience();

  it("prints the public page, not a timeline-only shell", () => {
    assert.match(html, /PROPEL: Empowered to flourish/);
    assert.match(html, /Re-designing student success/);
    assert.match(html, /Explore the PROPEL model/);
    assert.match(html, /Explore the journey/);
    assert.match(html, /What’s possible/);
    assert.match(html, /Meet the team/);
    assert.match(html, /To our donors, thank you/);
    assert.match(html, /name="first_name"/);
    assert.match(html, /name="email"/);
    assert.match(html, /does not send anything/);
    assert.match(html, /https:\/\/universitycollege\.asu\.edu\/propel/);
    assert.doesNotMatch(html, /<script/i);
  });

  it("uses unique ids", () => {
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length, `duplicate ids: ${ids.filter((id, index) => ids.indexOf(id) !== index).join(", ")}`);
  });

  it("escapes text", () => {
    assert.equal(escapeHtml(`&<>"'`), "&amp;&lt;&gt;&quot;&#39;");
  });
});

describe("layout", () => {
  it("spaces the pathway nodes and the pillar anchors", () => {
    assert.equal(pathwayNodes.length, 3);
    assert.ok((pathwayNodes[1] ?? 0) > (pathwayNodes[0] ?? 0));
    assert.ok((pathwayNodes[2] ?? 0) > (pathwayNodes[1] ?? 0));
    assert.equal(pillarAnchors.length, 4);
    const centerish = viewPoint(50, 50);
    assert.equal(centerish.x, 500);
    assert.equal(centerish.y, 210);
  });
});
