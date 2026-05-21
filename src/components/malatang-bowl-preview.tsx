"use client";

import { useMemo } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { MenuChoice } from "@/data/malatang-menu";

type PreviewItem = MenuChoice & { quantity: number };

const heatTone: Record<string, string> = {
  normal: "mild",
  medium: "medium",
  hot: "hot",
  stress: "deep",
  oni: "deep",
  shura: "deep",
  jigoku: "deep",
};

const layerMap: Record<string, string> = {
  "wide-harusame": "wideNoodle",
  harusame: "noodle",
  "beef-noodle": "noodleDark",
  tteokbokki: "tteok",
  "sweet-potato-noodle": "sweetNoodle",
  "squid-ball": "ball",
  "pork-ball": "ball",
  "beef-ball": "ballDark",
  "crab-ball": "fishBall",
  wonton: "wonton",
  tsukune: "ball",
  "tofu-skin": "tofuSkin",
  "quail-egg": "egg",
  "shrimp-ball": "shrimpBall",
  "shrimp-gyoza": "gyoza",
  "fresh-yuba": "yuba",
  sausage: "sausage",
  eringi: "mushroom",
  enoki: "enoki",
  okra: "okra",
  kanikama: "kanikama",
  cabbage: "leaf",
  asparagus: "asparagus",
  "sweet-potato": "potato",
  shimeji: "mushroom",
  potato: "potato",
  spam: "spam",
  "bok-choy": "greens",
  nira: "greensThin",
  cilantro: "cilantro",
  "baby-corn": "corn",
  lotus: "lotus",
  wakame: "wakame",
  "pea-sprouts": "greensThin",
  tofu: "tofu",
  "white-negi": "negi",
  hakusai: "leaf",
  "wood-ear": "woodEar",
  taro: "taro",
  broccoli: "broccoli",
  shiitake: "shiitake",
  pumpkin: "pumpkin",
  "white-wood-ear": "whiteWoodEar",
  "beef-slice": "meatSlice",
  mochi: "mochi",
  spinach: "greens",
  eggplant: "eggplant",
  celery: "celery",
  "mini-hamburg": "hamburg",
  carrot: "carrot",
  lettuce: "leaf",
  kaiware: "greensThin",
  lamb: "meatSlice",
  scallop: "scallop",
  "squid-ring": "squidRing",
  "white-fish": "fish",
  clam: "clam",
  "chicken-slice": "meatSliceLight",
  "pork-tongue": "meatSlice",
  "pork-liver": "liver",
  "pork-offal": "offal",
  "pork-cartilage": "cartilage",
  "beef-suji": "suji",
  "large-shrimp": "shrimp",
  octopus: "octopus",
  oyster: "oyster",
  frankfurt: "frankfurt",
  camembert: "cheese",
  "seafood-set": "seafood",
  mozzarella: "mozzarella",
  "stem-lettuce": "stemLettuce",
};

const layerPositions = [
  { x: 18, y: 48, r: -16 },
  { x: 29, y: 32, r: 12 },
  { x: 43, y: 47, r: -4 },
  { x: 58, y: 34, r: 18 },
  { x: 70, y: 51, r: -12 },
  { x: 34, y: 61, r: 8 },
  { x: 52, y: 60, r: -18 },
  { x: 64, y: 42, r: 4 },
  { x: 23, y: 38, r: 20 },
  { x: 78, y: 40, r: -8 },
  { x: 46, y: 28, r: -10 },
  { x: 56, y: 50, r: 14 },
];

export function MalatangBowlPreview({
  heat,
  flavors,
  selectedItems,
}: {
  heat: string;
  flavors: string[];
  selectedItems: PreviewItem[];
}) {
  const { t } = useI18n();
  const layers = useMemo(() => {
    const expanded = selectedItems.flatMap((item) =>
      Array.from({ length: Math.min(item.quantity, 2) }, () => ({
        id: item.id,
        name: item.name,
        type: layerMap[item.id] || "default",
      })),
    );

    return expanded.slice(0, 12).map((item, index) => ({
      ...item,
      key: `${item.id}-${index}`,
      position: layerPositions[index % layerPositions.length],
    }));
  }, [selectedItems]);

  return (
    <section className="bowlPreviewPanel" aria-label={t("仕上がりプレビュー")}>
      <div className="bowlPreviewCopy">
        <p className="kicker">{t("Visual preview")}</p>
        <h2>{t("選んだ具材が、少しずつ一杯に重なります。")}</h2>
      </div>
      <div className="bowlPreviewStage" data-heat={heatTone[heat] || "mild"}>
        <div className="previewBowl">
          <div className="previewSoup" />
          {flavors.includes("aroma") ? <span className="previewFlavor vinegar" /> : null}
          {flavors.includes("extra-spice") ? <span className="previewFlavor spice" /> : null}
          {layers.length ? (
            layers.map((layer) => (
              <span
                aria-hidden="true"
                className={`ingredientLayer ingredient-${layer.type}`}
                key={layer.key}
                style={{
                  left: `${layer.position.x}%`,
                  top: `${layer.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${layer.position.r}deg)`,
                }}
                title={t(layer.name)}
              />
            ))
          ) : (
            <span className="previewSteam" aria-hidden="true" />
          )}
          <div className="bowlRim" />
          <div className="bowlBody" />
        </div>
      </div>
    </section>
  );
}
