'use client';

import Image from 'next/image';

export default function Dropzone() {
  return (
    <div className="flex flex-col items-center justify-center cursor-pointer">
      <Image
        src="/transparent_icon.png"
        alt="Upload icon"
        width={128}
        height={128}
        className="w-32 h-32"
      />
    </div>
  );
}