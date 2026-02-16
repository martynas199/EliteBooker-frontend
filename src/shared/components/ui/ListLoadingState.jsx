import Card from "./Card";
import { ListSkeleton } from "./Skeleton";

export default function ListLoadingState({
  message = "Loading...",
  count = 6,
  itemHeight = "h-20",
  className = "",
}) {
  return (
    <Card className={`p-4 sm:p-6 ${className}`.trim()}>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <ListSkeleton count={count} itemHeight={itemHeight} />
    </Card>
  );
}
