import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import {
    HamburgerMenuIcon,
    DotFilledIcon,
    CheckIcon,
    ChevronRightIcon,
} from "@radix-ui/react-icons";


const DropdownMenuDemo = () => {
    const [bookmarksChecked, setBookmarksChecked] = React.useState(true);
    const [urlsChecked, setUrlsChecked] = React.useState(false);
    const [person, setPerson] = React.useState("pedro");

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="IconButton cursor-pointer rounded-md hover:bg-slate-200 transition-colors px-2 py-1 text-slate-900 border border-slate-300 duration-200   flex items-center gap-2 text-sm font-bold" aria-label="Customise options">
                    <HamburgerMenuIcon />
                    <p className="text-slate-950">Moneda</p>
                </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className="DropdownMenuContent bg-white border border-slate-300 rounded-md" sideOffset={5}>
                    <DropdownMenu.Item className="DropdownMenuItem cursor-pointer hover:bg-slate-200 transition-colors p-2">
                        <p className="text-slate-950 text-md font-bold flex items-center gap-2"><AttachMoneyIcon fontSize="small" /> Dolares </p>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="DropdownMenuItem mt-1 cursor-pointer hover:bg-slate-200 transition-colors p-2">
                        <p className="text-slate-950 text-md font-bold flex items-center gap-2"><AttachMoneyIcon fontSize="small" /> Pesos <span className="text-slate-400 text-xs font-normal">(COP)</span></p>
                    </DropdownMenu.Item>

                    <DropdownMenu.Arrow className="DropdownMenuArrow" />
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};

export default DropdownMenuDemo;
