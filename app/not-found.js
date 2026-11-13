import Image from 'next/image';

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 md:px-10">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center gap-8 md:flex-row md:gap-16">
        <div className="order-2 w-full text-center md:order-1 md:w-1/2 md:text-right">
          <h1 className="text-[22px] font-bold leading-relaxed text-[#282828] md:text-[30px]">
            اتصال با سرور برقرار نیست!
          </h1>

          <p className="mt-4 text-[16px] font-medium text-[#444] md:text-[20px]">
            لطفاً بعداً دوباره امتحان کنید.
          </p>
        </div>

        <div className="order-1 flex w-full justify-center md:order-2 md:w-1/2">
          <Image
            src="/images/404-astronaut.png"
            alt="ربات تورینو با کابل قطع‌شده"
            width={500}
            height={420}
            className="h-auto w-full max-w-[360px] object-contain md:max-w-[500px]"
            priority
          />
        </div>
      </div>
    </main>
  );
}
