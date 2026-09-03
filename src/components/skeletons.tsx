import { Skeleton } from "@/components/Skeleton";

function Header() {
  return (
    <header>
      <Skeleton width={140} height={11} />
      <Skeleton className="mt-2" width={180} height={30} />
    </header>
  );
}

export function PulseSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Header />

      <section className="card p-5">
        <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-4">
          <div>
            <Skeleton width={112} height={112} radius="999px" />
            <Skeleton className="mt-2 mx-auto" width={80} height={11} />
          </div>
          <div>
            <Skeleton width={120} height={12} />
            <Skeleton className="mt-2" width="80%" height={38} />
            <Skeleton className="mt-2" width="60%" height={12} />
            <Skeleton className="mt-2" width="45%" height={12} />
          </div>
        </div>
      </section>

      <section className="card p-4">
        <Skeleton width={120} height={20} />
        <Skeleton className="mt-2" width={150} height={12} />
      </section>

      <section className="card p-4">
        <div className="flex items-center justify-between">
          <Skeleton width={130} height={16} />
          <Skeleton width={80} height={12} />
        </div>
        <div className="mt-3 space-y-4">
          <Skeleton height={16} />
          <Skeleton height={16} width="85%" />
          <Skeleton height={16} width="70%" />
        </div>
      </section>

      <section className="card p-4">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <Skeleton width={56} height={56} radius="999px" />
          <div>
            <Skeleton width="70%" height={14} />
            <Skeleton className="mt-2" width="50%" height={12} />
          </div>
        </div>
      </section>
    </div>
  );
}

export function HubsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Header />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <Skeleton width={48} height={48} radius="var(--radius-tile)" />
              <div>
                <Skeleton width="55%" height={16} />
                <Skeleton className="mt-2" width="75%" height={12} />
                <Skeleton className="mt-2" width="45%" height={11} />
              </div>
              <Skeleton width={32} height={12} />
            </div>
            <Skeleton className="mt-3" height={6} radius="999px" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HubDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton width={120} height={16} />
      <Header />
      <Skeleton height={44} />
      <div className="card p-4">
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <Skeleton width={22} height={22} radius="999px" />
              <div>
                <Skeleton width="70%" height={15} />
                <Skeleton className="mt-2" width="40%" height={11} />
              </div>
              <Skeleton width={40} height={11} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      {[0, 1, 2, 3].map((c) => (
        <div key={c} className="card p-4">
          <Skeleton width={100} height={12} />
          <div className="mt-3 space-y-3">
            <Skeleton height={44} />
            <Skeleton height={44} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DaySkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Header />
      <section className="card p-5">
        <div className="grid place-items-center">
          <Skeleton width={224} height={224} radius="999px" />
          <Skeleton className="mt-4" width={160} height={14} />
          <Skeleton className="mt-3" width="100%" height={44} />
        </div>
      </section>
      <section className="card p-4">
        <Skeleton width={170} height={16} />
        <div className="mt-3 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
              <Skeleton width={24} height={24} radius="999px" />
              <Skeleton height={15} width="70%" />
              <Skeleton width={24} height={24} radius="999px" />
            </div>
          ))}
        </div>
      </section>
      <section className="card p-4">
        <Skeleton width={120} height={16} />
        <Skeleton className="mt-3" height={15} width="60%" />
      </section>
    </div>
  );
}

export function LumiSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <header className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <Skeleton width={56} height={56} radius="999px" />
        <div>
          <Skeleton width={110} height={11} />
          <Skeleton className="mt-2" width={150} height={26} />
        </div>
      </header>
      <div className="space-y-5">
        <div className="card p-4">
          <Skeleton width="85%" height={14} />
          <Skeleton className="mt-2" width="60%" height={14} />
        </div>
        <div className="card p-4">
          <Skeleton width="70%" height={14} />
        </div>
        <div className="card p-4">
          <Skeleton width="90%" height={14} />
          <Skeleton className="mt-2" width="75%" height={14} />
          <Skeleton className="mt-2" width="45%" height={14} />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Header />
      <section className="card p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
          <Skeleton width={68} height={68} radius="999px" />
          <div>
            <Skeleton width="50%" height={11} />
            <Skeleton className="mt-2" width="65%" height={22} />
            <Skeleton className="mt-2" width="55%" height={12} />
          </div>
        </div>
      </section>
      {[0, 1, 2, 3].map((i) => (
        <section key={i} className="card p-4">
          <Skeleton width="45%" height={16} />
          <Skeleton className="mt-2" width="80%" height={12} />
        </section>
      ))}
    </div>
  );
}
