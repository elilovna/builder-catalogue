type SwatchProps = {
  hex: string;
};

export const Swatch = ({ hex }: SwatchProps) => (
  <span
    aria-hidden="true"
    className="size-4 shrink-0 rounded-[4px] shadow-[inset_0_-2px_0_rgb(0_0_0/0.18),0_0_0_1px_rgb(20_26_36/0.12)]"
    style={{ backgroundColor: hex }}
  />
);

type ColourSwatchProps = {
  name: string;
  hex: string;
};

export const ColourSwatch = ({ name, hex }: ColourSwatchProps) => (
  <span className="inline-flex items-center gap-2">
    <Swatch hex={hex} />
    {name}
  </span>
);
