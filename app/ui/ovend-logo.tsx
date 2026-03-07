import Image from 'next/image';

export default function OvendLogo() {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/brandname.svg"
        alt="Ovend"
        width={100}
        height={32}
        priority
        className="brightness-0 invert"
      />
    </div>
  );
}
