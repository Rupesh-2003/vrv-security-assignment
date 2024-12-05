import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Head from 'next/head';

// Components
import Navbar from '@/components/navbar';
import CollapsibleSettings from '@/components/collapsible-settings';
import Report from '@/components/report';

// UI Elements
import { Button } from '@/components/ui/button';


export default function Home() {
  const [suspiciousThreshold, setSuspiciousThreshold] = useState(10)
  const [file, setFile] = useState(null)
  const [report, setReport] = useState(null)

  const onDrop = useCallback(acceptedFiles => {
    setFile(acceptedFiles[0])

    const formdata = new FormData();
    formdata.append("log_file", acceptedFiles[0], "sample.log");
    formdata.append("threshold", suspiciousThreshold);

    const requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow"
    };

    fetch("http://127.0.0.1:5000/upload_log", requestOptions)
      .then((response) => response.json())
      .then((result) => setReport(result))
      .catch((error) => console.error(error));
  }, [suspiciousThreshold])

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <>
      <Head>
        <title>Log analyser</title>
        <meta name="description" content="vrv security assignment" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!report ? 
      <main className='flex flex-col h-full'>
        <Navbar report={report} setFile={setFile} setReport={setReport}/>
        <div>
          <div className='font-bold text-[28px] text-[#303030] text-center mt-[25px] mb-[15px]'>Logs Analyser</div>
          <div className='text-center mb-[40px]'>upload your log file to get detailed analysis</div>
          <div {...getRootProps()} className='flex flex-col items-center bg-[#FCFCFF] w-[600px] border-[2px] border-[#A3A3CA] border-dashed rounded-[5px] ml-auto mr-auto'>
            <input {...getInputProps({
              accept: '.log'
              })} className='bg-yellow-200 w-[100px] h-[200px]'/>
            <img src='/file.png' className='w-[50px] mt-[30px] mb-[30px]'/>
            {
              isDragActive ?
                <p>Drop the files here ...</p> :
                <p className=' font-medium text-[18px]'>Drag and drop to upload the log file or</p>
            }
          <Button variant="outline" className=" font-medium text-[16px] mt-[25px] text-[#383957] border-[#A3A3CA] border-[1.2px]">Browse computer</Button>
          <div className='flex justify-center items-center mt-[50px] font-normal'>• You can upload only .log files</div>
          <div className='flex justify-center items-center mt-[5px] mb-[30px] font-normal'>• No Maximum limit</div>
          </div>
          <CollapsibleSettings suspiciousThreshold={setSuspiciousThreshold} setValue={setSuspiciousThreshold} threshold={suspiciousThreshold}/>
        </div>
      </main>
      : 
        <>
        <Navbar report={report} setFile={setFile} setReport={setReport}/>
        <Report data={report} file={file} threshold={suspiciousThreshold}/>
        </>
      }
    </>
  )
}
