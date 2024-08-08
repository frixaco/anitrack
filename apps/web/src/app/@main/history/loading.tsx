import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="p-4 w-full grid place-items-center">
      <Spinner />
    </div>
  );
}
