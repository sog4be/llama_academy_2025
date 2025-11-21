import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemDisplayProps {
  title: string;
  description: string;
}

export function ProblemDisplay({ title, description }: ProblemDisplayProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
