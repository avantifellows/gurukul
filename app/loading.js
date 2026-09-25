"use client"

import { useAuth } from "@/services/AuthContext";
import BottomNavigationBar from "@/components/BottomNavigationBar";

export default function Loading({ showReportsOnly = false, showLibraryOnly = false, showChapterContentOnly = false, cardCount = 3 }) {
    const { groupConfig } = useAuth();

    const ShimmerCard = ({ showTimeColumn = false }) => (
        <div className="flex mt-4 items-center animate-pulse lg:mt-0 lg:mb-3">
            {showTimeColumn && (
                <div className="flex flex-col gap-2 mx-3 md:mx-8 lg:w-[7.25rem] lg:shrink-0 lg:items-end lg:pr-4 lg:mx-0">
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                    <div className="h-3 w-12 bg-gray-200 rounded"></div>
                </div>
            )}
            <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 md:mr-8 items-center lg:mr-0 lg:ml-5 lg:min-h-0 lg:py-7 lg:rounded-xl lg:shadow-none lg:border lg:border-line">
                <div className="bg-gray-200 h-full w-2 absolute left-0 top-0 rounded-s-md"></div>
                <div className="mx-6 md:mx-8 flex flex-col gap-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="mr-4">
                    <div className="h-8 w-14 bg-gray-200 rounded-md"></div>
                </div>
            </div>
        </div>
    );

    const TestShimmerCard = () => (
        <div className="flex items-center mt-4 animate-pulse lg:mt-0 lg:mb-3">
            <div className="bg-white rounded-lg shadow-lg min-h-[120px] py-3 relative w-full flex flex-row justify-between mx-4 items-center lg:mx-0 lg:ml-[8.5rem] lg:min-h-0 lg:py-7 lg:rounded-xl lg:shadow-none lg:border lg:border-line">
                <div className="bg-gray-200 h-full w-2 absolute left-0 top-0 rounded-s-md"></div>
                <div className="flex flex-col gap-2 pl-6 flex-1">
                    <div className="h-3 w-24 bg-gray-200 rounded absolute top-2 left-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mt-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="flex flex-col gap-2 pr-2">
                    <div className="h-8 w-[118px] md:w-36 bg-gray-200 rounded-md"></div>
                    <div className="h-2 w-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        </div>
    );

    const ReportShimmerCard = () => (
        <div className="flex items-center animate-pulse">
            <div className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2 w-full lg:mx-0 lg:my-0 lg:mb-3 lg:h-20 lg:bg-white lg:border lg:border-line lg:rounded-xl lg:shadow-none">
                <div className="bg-gray-200 h-full w-2 absolute left-0 top-0 rounded-s-md"></div>
                <div className="mx-6 md:mx-8 flex flex-col gap-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
            </div>
        </div>
    );

    const LibraryShimmerCard = () => (
        <div className="mx-5 animate-pulse lg:mx-0">
            {/* Chapter Header Shimmer */}
            <div className="bg-white px-4 py-4 mb-4 flex flex-row justify-between items-center lg:rounded-lg lg:py-3 lg:mb-3 lg:border lg:border-line">
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
            </div>
        </div>
    );

    const SectionShimmer = ({ title, cardCount = 3, showTimeColumn = false, isTestSection = false, isReportSection = false }) => (
        <div className={`pt-6 lg:pt-10 lg:bg-transparent ${isReportSection ? 'bg-white' : ''}`}>
            <div className="h-6 w-32 bg-gray-200 rounded ml-4 mb-4 animate-pulse lg:ml-0"></div>
            <div className="grid grid-cols-1 gap-4 pb-4 lg:gap-0 lg:pb-0">
                {Array.from({ length: cardCount }).map((_, index) => (
                    <div key={index}>
                        {isReportSection ? (
                            <ReportShimmerCard />
                        ) : isTestSection ? (
                            <TestShimmerCard />
                        ) : (
                            <ShimmerCard showTimeColumn={showTimeColumn} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const LibrarySectionShimmer = ({ cardCount = 3 }) => (
        <div className="pb-40 lg:pb-0 lg:pt-4">
            {Array.from({ length: cardCount }).map((_, index) => (
                <LibraryShimmerCard key={index} />
            ))}
        </div>
    );

    const ChapterContentShimmer = ({ cardCount = 2 }) => (
        <div className="animate-pulse">
            {/* Topic Cards Shimmer */}
            {Array.from({ length: cardCount }).map((_, index) => (
                <div key={index} className="bg-gray-100 rounded-lg shadow-lg p-4 mx-2 mt-2 my-8 lg:mx-0 lg:my-4 lg:rounded-xl lg:shadow-none lg:border lg:border-line lg:bg-white">
                    {/* Topic Title */}
                    <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>

                    {/* Video Resources */}
                    <div className="space-y-3">
                        {Array.from({ length: 2 }).map((_, videoIndex) => (
                            <div key={videoIndex} className="flex items-center py-2">
                                <div className="w-10 h-10 bg-gray-200 rounded mr-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-36"></div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <main className={`${!showChapterContentOnly ? 'min-h-screen' : ''} max-w-xl mx-auto md:mx-auto bg-heading lg:bg-transparent ${showLibraryOnly || showChapterContentOnly ? 'lg:max-w-none' : 'lg:max-w-6xl lg:mx-auto lg:px-10'}`}>
            {/* Show only library shimmer when showLibraryOnly is true */}
            {showLibraryOnly ? (
                <>
                    <LibrarySectionShimmer cardCount={8} />
                </>
            ) : showReportsOnly ? (
                /* Show only reports shimmer when showReportsOnly is true */
                <SectionShimmer title="Reports" cardCount={5} isReportSection={true} />
            ) :
                showChapterContentOnly ? (
                    /* Show only chapter content shimmer when showChapterContentOnly is true */
                    <ChapterContentShimmer cardCount={2} />
                ) :
                    (
                        <>
                            {/* Live Classes Shimmer - only show if enabled in groupConfig */}
                            {groupConfig.showLiveClasses && (
                                <SectionShimmer title="Live Classes" cardCount={2} showTimeColumn={true} />
                            )}

                            {/* Tests Shimmer - only show if enabled in groupConfig */}
                            {groupConfig.showTests && (
                                <SectionShimmer title={groupConfig.testsSectionTitle || 'Tests'} cardCount={3} isTestSection={true} />
                            )}

                            {/* Practice Tests Shimmer - only show if enabled in groupConfig */}
                            {groupConfig.showPracticeTests && (
                                <SectionShimmer title="Practice Tests" cardCount={2} isTestSection={true} />
                            )}

                            {/* Homework Shimmer - only show if enabled in groupConfig */}
                            {groupConfig.showHomework && (
                                <SectionShimmer title="Homework" cardCount={1} isTestSection={true} />
                            )}
                        </>
                    )}

            {!showLibraryOnly && !showChapterContentOnly && <div className="pb-40 lg:pb-0"></div>}
            <BottomNavigationBar />
        </main>
    );
}