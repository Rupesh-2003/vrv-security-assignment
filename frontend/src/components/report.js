import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';

import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';

  
const Report = ({data, file, threshold}) => {
  
    const downloadReport = () => {
        const formdata = new FormData();
        formdata.append("log_file", file, "sample.log");
        formdata.append("threshold", threshold);
    
        const requestOptions = {
        method: "POST",
        body: formdata,
        redirect: "follow",
        };
    
        // Make the POST request to the Flask API to generate and get the report in csv format
        fetch("https://vrv-security-assignment-ox5t.onrender.com/download_report", requestOptions)
        .then((response) => {
            if (response.ok) {
            return response.blob(); // If the response is valid, get the blob (CSV file)
            } else {
            throw new Error("Failed to fetch the report");
            }
        })
        .then((blob) => {
            // Create a link element to trigger the file download
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "log_analysis_results.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
        .catch((error) => {
            console.error("Error downloading the report:", error);
        });
    };

    return (
        <>
            <div className="w-full min-h-[calc(100vh-60px)] h-auto bg-[#FAFAFA]">
                <div className="flex flex-row justify-center items-center pt-[20px] mb-[20px] font-medium text-[26px] text-[#347EFF] text-center gap-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
                    </svg>
                    Analysis Report
                </div>
                <div className="flex flex-row flex-wrap justify-around max-h-[calc(100vh-220px)]">
                    <Card className="rounded-sm box-border pb-[15px] self-start">
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-[10px]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                            </svg>

                            Request per IP Address</CardTitle>
                        <CardDescription>list of IP Address with their request count</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[calc(100vh-340px)] overflow-y-scroll">
                        <Table className="border-[1px] rounded-md">
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[250px] text-center">IP Address</TableHead>
                            <TableHead className="w-[200px] border-l-[1px] text-center">Request Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {data.requests_per_ip.length > 0 && data.requests_per_ip.map((item) => (
                            <TableRow key={item}>
                                <TableCell className="font-medium text-center">{item[0]}</TableCell>
                                <TableCell className="border-l-[1px] text-center">{item[1]}</TableCell>
                            </TableRow>
                        ))}

                        {data.requests_per_ip.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center">No data found in the .log file<br/>
                                </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                        </Table>
                    </CardContent>
                    </Card>

                    <Card className="rounded-sm box-border pb-[15px] self-start">
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-[10px]">
                            <img src="/exclamationmark.png" className="w-[20px] h-[20px]"/>
                            Suspicious Activity</CardTitle>
                        <CardDescription>list of IP Address with failed login attempts more than {threshold}</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[calc(100vh-340px)] overflow-y-scroll">
                        <Table className="border-[1px] rounded-md">
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px] text-center">IP Address</TableHead>
                                <TableHead className="w-[200px] border-l-[1px] text-center">Failed Login Attempts</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {data.suspicious_activity.length > 0 && data.suspicious_activity.map((item) => (
                                <TableRow key={item}>
                                <TableCell className="font-medium text-center">{item[0]}</TableCell>
                                <TableCell className="border-l-[1px] text-center">{item[1]}</TableCell>
                                </TableRow>
                            ))}

                            {data.suspicious_activity.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No suspicious activity found.<br/>
                                        You can change the threshold value and check.</TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    </Card>

                    <div className="flex flex-col">
                    <Card className="rounded-sm self-start">
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-[10px]">
                        <img src="/frequent.png" className="w-[25px] h-[25px]"/>
                            Most Accessed endpoint</CardTitle>
                        <CardDescription>endpoint which got the most number of hits</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Table className="border-[1px] rounded-md">
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-[100px] text-center">Endpoint</TableHead>
                            <TableHead className="w-[100px] border-l-[1px] text-center">Access Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.most_accessed_endpoint.access_count > 0 && <TableRow>
                            <TableCell className="font-medium text-center">{data.most_accessed_endpoint.endpoint}</TableCell>
                            <TableCell className="w-[100px] border-l-[1px] text-center">{data.most_accessed_endpoint.access_count}</TableCell>
                            </TableRow>}

                            {data.most_accessed_endpoint.access_count === 0 && (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center">No data found in the .log file</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </CardContent>
                    </Card>

                    <Card className="rounded-sm self-start mt-[20px] w-full">
                        <CardHeader>
                            <CardTitle className="flex flex-row items-center gap-[10px]">
                            <img src="/fast.png" className="w-[25px]"/>
                                Processing time taken</CardTitle>
                            <CardDescription>time taken by the python script to process</CardDescription>

                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-row items-center gap-[8px]">
                                <div className="text-[22px] font-medium text-[#347EFF]">{data.number_of_rows}</div>
                                <div>rows analysed in just</div>
                            </div>

                            <h1 className="text-[42px] font-medium text-[#004ACA]">{data.processing_time} secs</h1>
                        </CardContent>
                    </Card>

                    </div>
                </div>
                <div className="flex mt-[20px]">
                    <Button className="ml-auto mr-auto bg-[#347EFF]" onClick={downloadReport}>
                        Download Report 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                    </Button>
                </div>
            </div>
        </>
    )
}

export default Report