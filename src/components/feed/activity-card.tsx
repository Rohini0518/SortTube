import { TrendingUp, Clock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pill } from "@/components/ui/pill";
import { IconCircle } from "@/components/ui/icon-circle";
import { Byline } from "@/components/editorial/byline";
import { Thumbnail } from "@/components/content/thumbnail";
import type { Activity, Creator, Video } from "@/lib/types";

type EnrichedActivity = Activity & { creator: Creator; video?: Video };

function headlineFor(activity: EnrichedActivity) {
  switch (activity.type) {
    case "milestone":
      return `${activity.creator.name} crossed a subscriber milestone`;
    case "new-video":
      return `${activity.creator.name} posted a new video`;
    case "title-change":
      return `${activity.creator.name} is testing a video's title`;
  }
}

export function ActivityCard({ activity }: { activity: EnrichedActivity }) {
  return (
    <Card shadow="slate" hover={false} className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-lg font-extrabold text-foreground">{headlineFor(activity)}</h3>
        <Pill icon={Clock} tone="cream">
          {activity.timeAgo}
        </Pill>
      </div>

      {activity.type === "milestone" && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <IconCircle icon={TrendingUp} tone="quaternary" size="lg" />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-foreground">{activity.subscriberCount}</span>
            <span className="font-body text-sm font-semibold text-muted-foreground">subscribers</span>
            <Pill tone="mint">↗ {activity.delta}</Pill>
          </div>
          <span className="w-full font-body text-sm text-muted-foreground sm:w-auto">
            up from {activity.previousCount}
          </span>
        </div>
      )}

      {activity.type === "new-video" && activity.video && (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Thumbnail video={activity.video} aspect="aspect-video" className="w-full sm:w-56" />
          <div className="min-w-0 flex-1">
            <p className="font-heading text-base font-bold text-foreground">{activity.video.title}</p>
            <Byline creator={activity.creator} className="mt-2" />
          </div>
        </div>
      )}

      {activity.type === "title-change" && activity.titleVariants && (
        <div className="mt-4">
          <p className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-tertiary" strokeWidth={2.5} />
            Rotating between {activity.titleVariants.length} titles:
          </p>
          <ul className="mt-2 space-y-1.5">
            {activity.titleVariants.map((variant) => (
              <li key={variant} className="font-heading text-sm font-bold text-foreground before:mr-2 before:content-['•']">
                {variant}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
