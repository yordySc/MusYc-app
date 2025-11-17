import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

type IconType = "Ionicons" | "FontAwesome";
interface IconItemProps { type: IconType; name: any; size: number; color: string; style?: StyleProp<ViewStyle>; }

const IconItem: React.FC<IconItemProps> = ({ 
  type, name, size, color, style }) => {
  if (type === "Ionicons") { 
    return <Ionicons name={name} size={size} color={color} style={style} />; }
  return <FontAwesome name={name} size={size} color={color} style={style} />;
};

export default IconItem;