import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = ({report, setReport, setFile}) => {
    const onclickHandler = () => {
        setReport(null);
        setFile(null);
    }

    const downloadSampleFile = (filePath) => {
        const anchor = document.createElement('a');
        anchor.href = filePath;
        anchor.download = filePath.split('/').pop();
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    };

    return (
        <div className="flex flex-row items-center w-full h-[60px] bg-white border-[1.3px] border-[#E8E8EA] cursor-pointer">
            <img src="/logo.png" className="h-[30px] ml-[20px] mt-[5px]"/>
            <div className="font-bold text-[28px] text-[#347EFF] self-center" onClick={onclickHandler}>LogMiner</div>

            {report && <Button variant="outline" className="ml-auto mr-[30px]" onClick={onclickHandler}>Cancel</Button>}
            
            {!report &&<DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto mr-[30px]">Download sample .log file</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>Samples</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <div onClick={() => downloadSampleFile("/small_sample.log")}>Small sample.log</div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <div onClick={() => downloadSampleFile("/large_sample.log")}>Large sample.log</div>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <div onClick={() => downloadSampleFile("/very_large_sample.log")}>Very large sample.log</div>
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>}

        </div>
    )
};

export default Navbar;