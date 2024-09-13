'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface FaceIDCaptureProps {
  onSuccess: () => void;
  onFailure: () => void;
  onClose: () => void;
}

export default function FaceIDCapture({ onSuccess, onFailure, onClose }: FaceIDCaptureProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'success' | 'failed'>('idle');
  const [faceDetected, setFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setVerificationStatus('failed');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startVerification = async () => {
    setIsVerifying(true);
    setVerificationStatus('verifying');
    setTimeout(detectFace, 1000);
  };

  const detectFace = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Chamar a API para verificar o Face ID
        try {
          const response = await fetch('/api/faceid/verify/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageData: imageData.data }),
          });

          const result = await response.json();
          const success = result.success;

          if (success) {
            setVerificationStatus('success');
            setIsVerifying(false);
            onSuccess();
          } else {
            setVerificationStatus('failed');
            setIsVerifying(false);
            onFailure();
          }
        } catch (err) {
          console.error("Error verifying face ID:", err);
          setVerificationStatus('failed');
          setIsVerifying(false);
          onFailure();
        }
      }
    }
  };

  const resetVerification = () => {
    stopCamera();
    setVerificationStatus('idle');
    setFaceDetected(false);
    setIsVerifying(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <Card className="w-full max-w-md mx-4 bg-white shadow-lg">
        <CardHeader>
          <CardTitle>Face ID Verification</CardTitle>
          <CardDescription>Position your face within the circle for verification</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-primary">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" width="300" height="300" />
            <div className="absolute inset-0 border-8 border-dashed border-white rounded-full opacity-50" />
          </div>
          {verificationStatus === 'idle' && (
            <Button onClick={startVerification} className="w-full">
              <Camera className="mr-2 h-4 w-4" /> Start Verification
            </Button>
          )}
          {verificationStatus === 'verifying' && (
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>{faceDetected ? 'Verifying...' : 'Detecting face...'}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {faceDetected ? 'Please hold still' : 'Please position your face within the circle'}
              </p>
            </div>
          )}
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center space-y-2">
              <CheckCircle className="text-green-500" />
              <span className="text-lg font-bold">Verification Successful!</span>
            </div>
          )}
          {verificationStatus === 'failed' && (
            <div className="flex flex-col items-center space-y-2">
              <XCircle className="text-red-500" />
              <span className="text-lg font-bold">Verification Failed</span>
              <Button onClick={resetVerification} className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}