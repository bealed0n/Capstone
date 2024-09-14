import {
  Text,
  View,
  ViewProps,
  TextProps
} from './Themed';

import { Image, ImageProps } from "react-native";


import tailwind from "twrnc";

interface CardImageProps extends ImageProps {
  position?: "top" | "middle" | "bottom";
}

export const CardImage = ({
  source,
  style,
  resizeMode,
  position = "middle",
  ...props
}: CardImageProps) => {
  const positions = {
    top: tailwind`rounded-t-xl`,
    middle: tailwind``,
    bottom: tailwind`rounded-b-xl`,
  };

  return (
    <Image
      {...props}
      source={source}
      style={[tailwind`w-full h-120`, positions[position], style]}
      resizeMode={resizeMode || "cover"}
    />
  );
};

export const CardContent = ({ children, style, ...props }: ViewProps) => {
  return (
    <View {...props} style={[tailwind`p-6`, style]}>
      {children}
    </View>
  );
};

export const CardTitle = ({ children, style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      style={[
        tailwind` dark:text-neutral-50 text-lg font-bold`,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const CardSubtitle = ({ children, style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      style={[
        tailwind` dark:text-neutral-200 text-sm font-bold`,
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export const CardText = ({ children, style, ...props }: TextProps) => {
  return (
    <Text
      {...props}
      style={[tailwind` dark:text-neutral-200 text-sm`, style]}
    >
      {children}
    </Text>
  );
};

/**
 * React Native card component built with Tailwind CSS
 */
export const Card = ({ children, style, ...props }: ViewProps) => {
  return (
    <View
      {...props}
      style={[
        tailwind`rounded-lg border border-gray-600 overflow-hidden`,
        style,
      ]}
    >
      {children}
    </View>
  );
};
