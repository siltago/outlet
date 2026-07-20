export default function LoadingProdutos() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded-brand bg-brand-gray-100" />
      <div className="h-10 w-full animate-pulse rounded-brand bg-brand-gray-100" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-14 w-full animate-pulse rounded-brand bg-brand-gray-100" />
        ))}
      </div>
    </div>
  );
}
