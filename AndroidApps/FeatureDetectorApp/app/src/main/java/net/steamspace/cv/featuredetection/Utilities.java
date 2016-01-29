package net.steamspace.cv.featuredetection;

import android.graphics.Bitmap;
import android.os.Environment;
import android.util.Log;

import org.opencv.android.Utils;
import org.opencv.core.Mat;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.text.SimpleDateFormat;
import java.util.Date;

public class Utilities {
    private static final String  TAG                 = "ORBDetector::Utilities";
    public static final int MEDIA_TYPE_IMAGE = 1;
    public static final int MEDIA_TYPE_VIDEO = 2;

    public static String writeToFile(String fileNameRoot, String data) {
        try {
            File mediaStorageDir = getStorageDirectory();
            File outputFile = File.createTempFile(fileNameRoot, ".yml", mediaStorageDir);
            FileOutputStream stream = new FileOutputStream(outputFile);
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(stream);
            outputStreamWriter.write(data);
            outputStreamWriter.close();
            stream.close();
            String fileName = outputFile.getAbsolutePath();
//            Log.i(TAG, fileName);
            return fileName;
        }
        catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }
    public static void saveImg(Mat outputImage) {
        File pictureFile = getOutputMediaFile(MEDIA_TYPE_IMAGE);
        if (pictureFile == null){
            Log.e(TAG, "Error creating media file, check storage permissions: ");
            return;
        }
        try {
            FileOutputStream fos = new FileOutputStream(pictureFile);
            Bitmap m_bmp = Bitmap.createBitmap(outputImage.width(), outputImage.height(),
                    Bitmap.Config.ARGB_8888);
            Utils.matToBitmap(outputImage, m_bmp);
            m_bmp.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.flush();
            fos.close();
            Log.d(TAG, "Saved image as: " + pictureFile.getName());
        } catch (FileNotFoundException e) {
            Log.d(TAG, "File not found: " + e.getMessage());
        } catch (IOException e) {
            Log.d(TAG, "Error accessing file: " + e.getMessage());
        }
    }
    private static File getOutputMediaFile(int type){
        File mediaStorageDir = getStorageDirectory();
        // Create a media file name
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File mediaFile;
        if (type == MEDIA_TYPE_IMAGE){
            mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                    "IMG_"+ timeStamp + ".jpg");
        } else if(type == MEDIA_TYPE_VIDEO) {
            mediaFile = new File(mediaStorageDir.getPath() + File.separator +
                    "VID_"+ timeStamp + ".mp4");
        } else {
            return null;
        }

        return mediaFile;
    }
    public static File getStorageDirectory() {
        // To be safe, you should check that the SDCard is mounted
        // using Environment.getExternalStorageState() before doing this.

        File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_PICTURES), "FeatureDetectionApp");
        // This location works best if you want the created images to be shared
        // between applications and persist after your app has been uninstalled.

        // Create the storage directory if it does not exist
        if (! mediaStorageDir.exists()){
            if (! mediaStorageDir.mkdirs()){
                Log.d("FeatureDetectionApp", "failed to create directory");
                return null;
            }
        }
        return mediaStorageDir;
    }
}
