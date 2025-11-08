
import React, { useState, useCallback } from 'react';
import { ImageSlot, SeparationMode, Result } from './types';
import { fileToBase64, separateCharacterParts } from './services/geminiService';

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface ImageUploaderProps {
    slot: ImageSlot;
    onImageChange: (id: number, file: File) => void;
    onSelectionChange: (id: number, isSelected: boolean) => void;
    onImageClear: (id: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ slot, onImageChange, onSelectionChange, onImageClear }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImageChange(slot.id, e.target.files[0]);
        }
    };

    return (
        <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-2 aspect-square flex flex-col justify-center items-center group bg-gray-800 hover:border-purple-500 transition-colors">
            {slot.base64 ? (
                <>
                    <img src={slot.base64} alt={`Ảnh ${slot.id}`} className="object-contain h-full w-full rounded-md" />
                    <div className="absolute top-1 right-1 flex items-center bg-gray-900 bg-opacity-70 p-1 rounded-md">
                        <input
                            type="checkbox"
                            checked={slot.isSelected}
                            onChange={(e) => onSelectionChange(slot.id, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                        />
                    </div>
                    <button
                        onClick={() => onImageClear(slot.id)}
                        className="absolute bottom-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Xóa ảnh"
                    >
                        <TrashIcon />
                    </button>
                </>
            ) : (
                <>
                    <label htmlFor={`upload-${slot.id}`} className="cursor-pointer text-center">
                        <UploadIcon />
                        <span className="mt-2 block text-sm font-medium text-gray-400">+ Tải ảnh lên</span>
                    </label>
                    <input id={`upload-${slot.id}`} type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                </>
            )}
            <span className="absolute bottom-1 left-2 text-xs font-semibold text-gray-500">Ảnh {slot.id}</span>
        </div>
    );
};

interface ResultCardProps {
    result: Result;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
    return (
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
                <p className="text-sm font-medium text-gray-400 mb-2 text-center">Ảnh gốc</p>
                <img src={result.inputImage} alt="Ảnh đầu vào" className="rounded-md w-full aspect-square object-contain bg-gray-700" />
            </div>
            <div className="w-full md:w-2/3 flex flex-col justify-center items-center">
                {result.status === 'processing' && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                        <p className="mt-4 text-purple-400">Đang xử lý...</p>
                    </div>
                )}
                {result.status === 'error' && (
                    <div className="flex flex-col items-center justify-center h-full text-center bg-red-900 bg-opacity-30 p-4 rounded-md">
                        <p className="text-red-400 font-semibold">Lỗi!</p>
                        <p className="text-red-500 text-sm mt-2">{result.error}</p>
                    </div>
                )}
                {result.status === 'completed' && result.outputImage && (
                    <div className="w-full">
                         <p className="text-sm font-medium text-gray-400 mb-2 text-center">Kết quả</p>
                        <img src={`data:image/png;base64,${result.outputImage}`} alt="Ảnh kết quả" className="rounded-md w-full aspect-square object-contain bg-gray-700/50" style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 32 32\' width=\'32\' height=\'32\' fill=\'none\'%3e%3cpath d=\'M0 0 H16 V16 H0 Z\' fill=\'%234a4a4a\' /%3e%3cpath d=\'M16 16 H32 V32 H16 Z\' fill=\'%234a4a4a\' /%3e%3c/svg%3e")' }}/>
                        <a
                            href={`data:image/png;base64,${result.outputImage}`}
                            download={`phuc-animation-result-${result.id}.png`}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg inline-flex items-center justify-center transition-colors"
                        >
                            <DownloadIcon />
                            <span>Tải ảnh (PNG 4K)</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};


export default function App() {
    const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
        { id: 1, file: null, base64: null, isSelected: false },
        { id: 2, file: null, base64: null, isSelected: false },
        { id: 3, file: null, base64: null, isSelected: false },
        { id: 4, file: null, base64: null, isSelected: false },
    ]);
    const [separationMode, setSeparationMode] = useState<SeparationMode>('basic');
    const [separateBackground, setSeparateBackground] = useState<boolean>(true);
    const [keepRatio, setKeepRatio] = useState<boolean>(true);
    const [customPrompt, setCustomPrompt] = useState<string>('');
    const [results, setResults] = useState<Result[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [progressMessage, setProgressMessage] = useState<string>('');

    const handleImageChange = (id: number, file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageSlots(prev => prev.map(slot => 
                slot.id === id ? { ...slot, file, base64: e.target?.result as string, isSelected: true } : slot
            ));
        };
        reader.readAsDataURL(file);
    };

    const handleSelectionChange = (id: number, isSelected: boolean) => {
        setImageSlots(prev => prev.map(slot => slot.id === id ? { ...slot, isSelected } : slot));
    };

    const handleImageClear = (id: number) => {
        setImageSlots(prev => prev.map(slot => 
            slot.id === id ? { ...slot, file: null, base64: null, isSelected: false } : slot
        ));
    };

    const handleProcess = useCallback(async () => {
        const selectedImages = imageSlots.filter(s => s.isSelected && s.file && s.base64);
        if (selectedImages.length === 0) {
            alert("Vui lòng tải lên và chọn ít nhất một ảnh để xử lý.");
            return;
        }

        setIsProcessing(true);
        setProgressMessage('Bắt đầu quá trình...');
        setResults(selectedImages.map(s => ({ id: s.id, inputImage: s.base64!, outputImage: null, status: 'processing' })));

        const basePrompt = `From the provided image, identify the main cartoon character. Create a new image that serves as a character sprite sheet for animation, resolution at 4K. The new image MUST have a transparent background. Lay out all the individual parts of the character separately on this transparent background. The parts should not overlap. The output must be a single PNG image with a transparent background.`;
        const modePrompt = separationMode === 'basic' 
            ? 'The parts to separate are: head, torso, left arm, right arm, left leg, and right leg.' 
            : 'The parts to separate should be very detailed: hair, eyes, mouth, head, torso, individual clothing items, accessories, left arm, right arm, left leg, and right leg.';
        let optionsPrompt = '';
        if (separateBackground) {
            optionsPrompt += ' The character must be fully isolated from its original background.';
        }
        if (keepRatio) {
            optionsPrompt += ' All separated parts must maintain their original proportions relative to each other.';
        }
        
        const finalPrompt = `${basePrompt} ${modePrompt} ${optionsPrompt} Additional user instructions: ${customPrompt || 'Không có'}`;

        for (let i = 0; i < selectedImages.length; i++) {
            const slot = selectedImages[i];
            setProgressMessage(`Đang phân tích nhân vật trong ảnh ${i + 1}/${selectedImages.length}...`);
            try {
                const { base64: fileData, mimeType } = await fileToBase64(slot.file!);
                setProgressMessage(`Đang tách các bộ phận cho ảnh ${i + 1}/${selectedImages.length}...`);
                const outputImage = await separateCharacterParts(fileData, mimeType, finalPrompt);
                setResults(prev => prev.map(res => res.id === slot.id ? { ...res, status: 'completed', outputImage } : res));
            } catch (error) {
                console.error(`Error processing image ${slot.id}:`, error);
                const errorMessage = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.";
                setResults(prev => prev.map(res => res.id === slot.id ? { ...res, status: 'error', error: errorMessage } : res));
            }
        }

        setProgressMessage('Hoàn tất!');
        setIsProcessing(false);
    }, [imageSlots, separationMode, separateBackground, keepRatio, customPrompt]);


    const totalSelected = imageSlots.filter(s => s.isSelected && s.file).length;
    const completedCount = results.filter(r => r.status === 'completed' || r.status === 'error').length;
    const progressPercentage = totalSelected > 0 ? (completedCount / totalSelected) * 100 : 0;

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
            <header className="text-center mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Phuc Animation
                </h1>
                <p className="text-lg text-gray-400 mt-2">Tách bộ phận nhân vật hoạt hình tự động bằng AI</p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Controls */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-3 border-l-4 border-purple-500 pl-3">1. Ảnh nhân vật đầu vào</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {imageSlots.map(slot => (
                                <ImageUploader 
                                    key={slot.id} 
                                    slot={slot} 
                                    onImageChange={handleImageChange}
                                    onSelectionChange={handleSelectionChange}
                                    onImageClear={handleImageClear}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-3 border-l-4 border-purple-500 pl-3">2. Chế độ tách</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <button onClick={() => setSeparationMode('basic')} className={`w-full p-3 rounded-lg font-medium transition-colors ${separationMode === 'basic' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Tách cơ bản</button>
                                <button onClick={() => setSeparationMode('detailed')} className={`w-full p-3 rounded-lg font-medium transition-colors ${separationMode === 'detailed' ? 'bg-purple-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>Tách chi tiết</button>
                            </div>
                            <div className="p-4 bg-gray-700 rounded-lg space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300">Tách riêng nền</span>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={separateBackground} onChange={e => setSeparateBackground(e.target.checked)} />
                                        <div className={`block w-14 h-8 rounded-full ${separateBackground ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${separateBackground ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                </label>
                                 <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-gray-300">Giữ nguyên tỉ lệ nhân vật</span>
                                    <div className="relative">
                                        <input type="checkbox" className="sr-only" checked={keepRatio} onChange={e => setKeepRatio(e.target.checked)} />
                                        <div className={`block w-14 h-8 rounded-full ${keepRatio ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${keepRatio ? 'transform translate-x-6' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-semibold mb-3 border-l-4 border-purple-500 pl-3">3. Câu lệnh (tùy chọn)</h2>
                        <textarea
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            placeholder="Ví dụ: Tách riêng đầu và hai tay, xuất nền trong suốt..."
                            className="w-full p-3 bg-gray-700 border-2 border-gray-600 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition"
                            rows={3}
                        />
                    </div>
                     <div className="mt-auto pt-6">
                        <button 
                            onClick={handleProcess}
                            disabled={isProcessing || totalSelected === 0}
                            className="w-full text-lg font-bold py-4 px-6 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-purple-500/50"
                        >
                            {isProcessing ? (
                                <>
                                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                 Đang xử lý...
                                </>
                            ) : (
                                `Tách ${totalSelected > 0 ? totalSelected : ''} bộ phận ảnh`
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h2 className="text-2xl font-bold mb-4 text-center">Kết quả</h2>
                    {results.length === 0 ? (
                        <div className="flex-grow flex items-center justify-center text-gray-500">
                            <p>Kết quả sẽ được hiển thị ở đây.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
                            {results.map(res => <ResultCard key={res.id} result={res} />)}
                        </div>
                    )}
                    {(isProcessing || completedCount > 0) && (
                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <p className="text-center font-medium mb-2">{progressMessage}</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
