import {
	AlertCircle as LucideAlertCircle,
	AlignJustify as LucideAlignJustify,
	CheckCircle as LucideCheckCircle,
	XCircle as LucideXCircle,
	Check as LucideCheck,
	ChevronLeft as LucideChevronLeft,
	ChevronRight as LucideChevronRight,
	ChevronUp as LucideChevronUp,
	ChevronDown as LucideChevronDown,
	ArrowLeft as LucideArrowLeft,
	AtSign as LucideAtSign,
	Bell as LucideBell,
	BellOff as LucideBellOff,
	BellRing as LucideBellRing,
	Dot as LucideDot,
	Eraser as LucideEraser,
	Heart as LucideHeart,
	Home as LucideHome,
	HelpCircle as LucideHelpCircle,
	ListMusic as LucideListMusic,
	ListPlus as LucideListPlus,
	Loader2 as LucideLoader2,
	Mail as LucideMail,
	MessageCircle as LucideMessageCircle,
	MessageSquareText as LucideMessageSquareText,
	Moon as LucideMoon,
	MoonStar as LucideMoonStar,
	MoreHorizontal as LucideMoreHorizontal,
	Pencil as LucidePencil,
	Rows3 as LucideRows3,
	Reply as LucideReply,
	Save as LucideSave,
	Search as LucideSearch,
	Send as LucideSend,
	Settings as LucideSettings,
	Shield as LucideShield,
	Square as LucideSquare,
	SquareCheck as LucideSquareCheck,
	SquarePlus as LucideSquarePlus,
	Star as LucideStar,
	Sun as LucideSun,
	Trash as LucideTrash,
	Trash2 as LucideTrash2,
	User as LucideUser,
	UserMinus as LucideUserMinus,
	UserCheck as LucideUserCheck,
	UserX as LucideUserX,
	UserPen as LucideUserPen,
	X as LucideX,
	Frown as LuicideFrown,
	LucideIcon,
	ReceiptText as LucideReceiptText,
	ShieldCheck as LucideShieldCheck,
	Hand as LucideHand,
	Plus as LucidePlus,
} from "lucide-react-native";
import { cssInterop } from "nativewind";

function iconWithClassName(icon: LucideIcon) {
	cssInterop(icon, {
		className: {
			target: "style",
			nativeStyleToProp: {
				color: true,
				opacity: true,
			},
		},
	});

	return icon;
}

// Export all icons
export const AlertCircle = iconWithClassName(LucideAlertCircle);
export const AlignJustify = iconWithClassName(LucideAlignJustify);
export const CheckCircle = iconWithClassName(LucideCheckCircle);
export const Check = iconWithClassName(LucideCheck);
export const ChevronLeft = iconWithClassName(LucideChevronLeft);
export const ChevronRight = iconWithClassName(LucideChevronRight);
export const ChevronUp = iconWithClassName(LucideChevronUp);
export const ChevronDown = iconWithClassName(LucideChevronDown);
export const XCircle = iconWithClassName(LucideXCircle);
export const ArrowLeft = iconWithClassName(LucideArrowLeft);
export const AtSign = iconWithClassName(LucideAtSign);
export const Bell = iconWithClassName(LucideBell);
export const BellOff = iconWithClassName(LucideBellOff);
export const BellRing = iconWithClassName(LucideBellRing);
export const Dot = iconWithClassName(LucideDot);
export const Eraser = iconWithClassName(LucideEraser);
export const Heart = iconWithClassName(LucideHeart);
export const HelpCircle = iconWithClassName(LucideHelpCircle);
export const Home = iconWithClassName(LucideHome);
export const ListMusic = iconWithClassName(LucideListMusic);
export const ListPlus = iconWithClassName(LucideListPlus);
export const Loader2 = iconWithClassName(LucideLoader2);
export const Mail = iconWithClassName(LucideMail);
export const MessageCircle = iconWithClassName(LucideMessageCircle);
export const MessageSquareText = iconWithClassName(LucideMessageSquareText);
export const Moon = iconWithClassName(LucideMoon);
export const MoonStar = iconWithClassName(LucideMoonStar);
export const MoreHorizontal = iconWithClassName(LucideMoreHorizontal);
export const Pencil = iconWithClassName(LucidePencil);
export const Rows3 = iconWithClassName(LucideRows3);
export const Reply = iconWithClassName(LucideReply);
export const Save = iconWithClassName(LucideSave);
export const Search = iconWithClassName(LucideSearch);
export const Send = iconWithClassName(LucideSend);
export const Settings = iconWithClassName(LucideSettings);
export const Shield = iconWithClassName(LucideShield);
export const Square = iconWithClassName(LucideSquare);
export const SquareCheck = iconWithClassName(LucideSquareCheck);
export const SquarePlus = iconWithClassName(LucideSquarePlus);
export const Star = iconWithClassName(LucideStar);
export const Sun = iconWithClassName(LucideSun);
export const Trash = iconWithClassName(LucideTrash);
export const Trash2 = iconWithClassName(LucideTrash2);
export const User = iconWithClassName(LucideUser);
export const UserMinus = iconWithClassName(LucideUserMinus);
export const UserCheck = iconWithClassName(LucideUserCheck);
export const UserX = iconWithClassName(LucideUserX);
export const UserPen = iconWithClassName(LucideUserPen);
export const X = iconWithClassName(LucideX);
export const Frown = iconWithClassName(LuicideFrown);
export const ReceiptText = iconWithClassName(LucideReceiptText);
export const ShieldCheck = iconWithClassName(LucideShieldCheck);
export const Hand = iconWithClassName(LucideHand);
export const Plus = iconWithClassName(LucidePlus);
