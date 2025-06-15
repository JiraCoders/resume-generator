import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { getDocOptions } from "@/config/docOptions";
import { JobDescriptionSchema, ResumeSchema } from "@/lib/validations";
import Docxtemplater from "docxtemplater";
import * as libre from "libreoffice-convert";
import PizZip from "pizzip";

const JIRACODERS_API_URL = "https://api-jiracoders.com/api/job/apply";

export function formatBullets(bulletsArray: string[]) {
    return bulletsArray.map((bullet) => {
        const words: string[] = bullet.split("**");
        const segments = words.map((word, index) => ({
            bold: index % 2 == 1 ? word : "",
            plain: index % 2 == 0 ? word : ""
        }));

        return { bullet: segments };
    });
}

export function isExistingCompanyName(basePath: string, companyName: string): boolean {
    const sanitizedCompanyName = sanitizeFileName(companyName);
    const prefix = `${sanitizedCompanyName}__`;

    const folders = findDeepestFolders(basePath);

    if (!fs.existsSync(basePath)) return false;

    return folders.some((entry) => entry.includes(companyName));
}

function sanitizeFileName(fileName: string): string {
    // eslint-disable-next-line no-control-regex
    return fileName.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").replace(/\.$/, ""); // Replace illegal characters with "_"
}

function createFolderWithCompanyName(basePath: string, companyName: string): string {
    const sanitizedCompanyName = sanitizeFileName(companyName);
    const companyFolderPath = path.resolve(basePath, `${sanitizedCompanyName}`);

    if (!fs.existsSync(companyFolderPath)) {
        fs.mkdirSync(companyFolderPath, { recursive: true });
    }

    return companyFolderPath;
}

function openFile(filePath: string) {
    const platform = process.platform;
    if (platform === "win32") {
        exec(`start "" "${filePath}"`);
    } else if (platform === "darwin") {
        exec(`open "${filePath}"`);
    } else {
        exec(`xdg-open "${filePath}"`);
    }
}

export async function exportResume(
    jobDescription: JobDescriptionSchema,
    resume: ResumeSchema,
    userName: string,
    templateName: string,
    folderPath: string,
    isConvertPDF: boolean,
    isOpenResume: boolean
) {
    const companyFolderPath = createFolderWithCompanyName(folderPath, jobDescription.companyName);

    const content = fs.readFileSync(path.join(process.cwd(), `templates/${templateName}`));
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true
    });

    doc.render(getDocOptions(resume));
    const buffer: Buffer = doc.getZip().generate({
        type: "nodebuffer",
        compression: "DEFLATE"
    });

    const docxOutputPath: string = path.resolve(companyFolderPath, `${userName.replace(" ", "_")}_Resume.docx`);

    fs.writeFileSync(docxOutputPath, buffer as unknown as Uint8Array);

    // Convert to PDF if settings are specified
    if (isConvertPDF) {
        const pdfOutputPath: string = path.resolve(companyFolderPath, `${userName.replace(" ", "_")}_Resume.pdf`);

        try {
            const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
                libre.convert(buffer, "pdf", undefined, (error, pdfBuffer) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(pdfBuffer);
                    }
                });
            });

            fs.writeFileSync(pdfOutputPath, pdfBuffer as unknown as Uint8Array);

            if (isOpenResume) {
                openFile(pdfOutputPath);
            }
        } catch (error) {
            console.error(`Error converting DOCX to PDF: ${error}`);
        }
    } else {
        if (isOpenResume) {
            openFile(docxOutputPath);
        }
    }
}

export async function exportCoverLetter(
    jobDescription: JobDescriptionSchema,
    resume: ResumeSchema,
    userName: string,
    templateName: string,
    folderPath: string,
) {
}

export async function exportJobDescription(jobDescription: JobDescriptionSchema, content: string, folderPath: string) {
    const companyFolderPath = createFolderWithCompanyName(folderPath, jobDescription.companyName);

    if (!fs.existsSync(companyFolderPath)) {
        fs.mkdirSync(companyFolderPath, { recursive: t rue });
    }

    const jobDescriptionPath = path.resolve(
        companyFolderPath,
        `${sanitizeFileName(jobDescription.roleTitle)}_Job_Description.txt`
    );
    fs.writeFileSync(jobDescriptionPath, content, { encoding: "utf8" });
}

export async function createJiracodersApplication(companyName: string, roleTitle: string) {
    try {
        // Load the token from the file
        const tokenPath = "tokens/jiracoders.key";
        const token = (await fs.promises.readFile(tokenPath, "utf-8")).trim();

        // Prepare the request body
        const requestBody = {
            companyName,
            position: roleTitle,
            token
        };

        // Make the POST request
        const response = await fetch(JIRACODERS_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Failed to apply: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating Jiracoders application:", error);
        throw error;
    }
}

export function findDeepestFolders(dir: string): string[] {
    const results: string[] = [];

    function recurse(currentPath: string): void {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });
        const subdirs = entries.filter((entry) => entry.isDirectory());

        if (subdirs.length === 0) {
            results.push(currentPath);
            return;
        }

        for (const subdir of subdirs) {
            recurse(path.join(currentPath, subdir.name));
        }
    }

    recurse(dir);
    return results;
}