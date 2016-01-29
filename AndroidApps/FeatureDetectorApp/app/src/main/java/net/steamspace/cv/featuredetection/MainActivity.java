package net.steamspace.cv.featuredetection;

import java.io.File;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import org.opencv.android.BaseLoaderCallback;
import org.opencv.android.CameraBridgeViewBase.CvCameraViewFrame;
import org.opencv.android.LoaderCallbackInterface;
import org.opencv.android.OpenCVLoader;
import org.opencv.calib3d.Calib3d;
import org.opencv.core.Core;
import org.opencv.core.CvType;
import org.opencv.core.DMatch;
import org.opencv.core.KeyPoint;
import org.opencv.core.Mat;
import org.opencv.core.MatOfDMatch;
import org.opencv.core.MatOfKeyPoint;
import org.opencv.core.MatOfPoint2f;
import org.opencv.core.Point;
import org.opencv.core.Scalar;
import org.opencv.core.Size;
import org.opencv.android.CameraBridgeViewBase;
import org.opencv.android.CameraBridgeViewBase.CvCameraViewListener2;
import org.opencv.features2d.DescriptorExtractor;
import org.opencv.features2d.DescriptorMatcher;
import org.opencv.features2d.FeatureDetector;
import org.opencv.features2d.Features2d;
import org.opencv.imgproc.Imgproc;

import android.app.Activity;
import android.os.Bundle;
import android.os.Environment;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.Window;
import android.view.WindowManager;
import android.widget.SeekBar;
import android.widget.TextView;
import android.widget.Toast;

import net.steamspace.cv.featuredetection.R;

public class MainActivity extends Activity implements CvCameraViewListener2, SeekBar.OnSeekBarChangeListener {
    private static final String  TAG                 = "OCVSample::Activity";
    String _toastMsg = "";

    public static final int      VIEW_MODE_RGBA      = 0;
    public static final int TRAIN = 8;
    public static final int SHOW_MATCHES = 9;
    public static final int SHOW_BOX = 10;
    public static final int SHOW_KEYPOINTS = 11;

    private MenuItem             mItemPreviewRGBA;
    private MenuItem mItemShowMatches;
    private MenuItem             mItemShowBox;
    private MenuItem             mItemShowKeypoints;
    private CameraBridgeViewBase mOpenCvCameraView;

    private Mat                  mIntermediateMat;

    public static int _viewMode = VIEW_MODE_RGBA;

    SeekBar _seekBarRansac;
    SeekBar _seekBarMinMax;
    TextView _minDistanceTextView;
    TextView _numMatchesTextView;
    TextView _ransacThresholdTextView;
    TextView _maxMinTextView;

    DescriptorExtractor descriptorExtractor;
    DescriptorMatcher _matcher;
    FeatureDetector _detector;

    Mat _descriptors;
    MatOfKeyPoint _keypoints;

    Mat _descriptors2;
    MatOfKeyPoint _keypoints2;

    int _lastViewMode = VIEW_MODE_RGBA;
    boolean _takePicture = false;

    // GUI Controls
    Mat _img1;
    String _numMatches;
    int _minDistance;
    int _ransacThreshold = 3;
    int _maxMin = 50;

    Menu _menu;
    MenuItem _modelMenu;
    int _featureDetectorID = FeatureDetector.ORB;
    int _descriptorExtractorID = DescriptorExtractor.ORB;

    private BaseLoaderCallback  mLoaderCallback = new BaseLoaderCallback(this) {
        @Override
        public void onManagerConnected(int status) {
            switch (status) {
                case LoaderCallbackInterface.SUCCESS:
                {
                    System.loadLibrary("nonfree");
//                    Log.i(TAG, "OpenCV loaded successfully");
                    mOpenCvCameraView.enableView();
                } break;
                default:
                {
                    super.onManagerConnected(status);
                } break;
            }
        }
    };

    public MainActivity() {

//        Log.i(TAG, "Instantiated new " + this.getClass());
    }

    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
//        Log.i(TAG, "called onCreate");
        super.onCreate(savedInstanceState);
//        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setContentView(R.layout.activity_main);

        mOpenCvCameraView = (CameraBridgeViewBase) findViewById(R.id.image_manipulations_activity_surface_view);
        mOpenCvCameraView.setCvCameraViewListener(this);
        _seekBarRansac = (SeekBar) findViewById(R.id.ransacSeekBar);
        _seekBarMinMax = (SeekBar) findViewById(R.id.maxMinSeekBar);
        _ransacThresholdTextView = (TextView) findViewById(R.id.ransacThreshold);
        _maxMinTextView = (TextView) findViewById(R.id.maxMinValue);
        _numMatchesTextView = (TextView) findViewById(R.id.numMatches);
        _minDistanceTextView = (TextView) findViewById(R.id.minValue);
        _seekBarRansac.setOnSeekBarChangeListener(this);
        _seekBarMinMax.setOnSeekBarChangeListener(this);
    }

    @Override
    public void onPause()
    {
        super.onPause();
        if (mOpenCvCameraView != null)
            mOpenCvCameraView.disableView();
    }

    @Override
    public void onResume()
    {
        super.onResume();
        if (!OpenCVLoader.initDebug()) {
            Log.d(TAG, "Internal OpenCV library not found. Using OpenCV Manager for initialization");
            OpenCVLoader.initAsync(OpenCVLoader.OPENCV_VERSION_3_0_0, this, mLoaderCallback);
        } else {
            Log.d(TAG, "OpenCV library found inside package. Using it!");
            mLoaderCallback.onManagerConnected(LoaderCallbackInterface.SUCCESS);
        }
    }

    public void onDestroy() {
        super.onDestroy();
        if (mOpenCvCameraView != null)
            mOpenCvCameraView.disableView();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
//        Log.i(TAG, "called onCreateOptionsMenu");
        mItemPreviewRGBA  = menu.add("Reset");
        mItemShowKeypoints = menu.add("Show Key Points");
        mItemShowMatches = menu.add("Show Matches");
        mItemShowBox = menu.add("Show Box");
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
//        Log.i(TAG, "called onOptionsItemSelected; selected item: " + item);
        if (item == mItemPreviewRGBA)
            _viewMode = VIEW_MODE_RGBA;
        else if (item == mItemShowMatches)
            _viewMode = SHOW_MATCHES;
        else if (item == mItemShowBox)
            _viewMode = SHOW_BOX;
        else if (item == mItemShowKeypoints)
            _viewMode = SHOW_KEYPOINTS;
        else if (item.getItemId() == R.id.action_train)
            _viewMode = TRAIN;
        else if (item.getItemId() == R.id.action_screen_shot)
            _takePicture = true;
        else if (item.getItemId() == R.id.ORB || item.getItemId() == R.id.BRISK || item.getItemId() == R.id.ORBFREAK
//                || item.getItemId() == R.id.SIFT || item.getItemId() == R.id.SURF || item.getItemId() == R.id.SURFBRIEF
                || item.getItemId() == R.id.STAR) {
            int id = item.getItemId();
            setModel(id);
            item.setChecked(true);
        }
        else {
            item.setChecked(!item.isChecked());
            if (item.getItemId() == R.id.Ratio && item.isChecked())
                _menu.findItem(R.id.KNN).setChecked(true);  // KNN must be checked if running ratio test.
        }
        return true;
    }

    public void onCameraViewStarted(int width, int height) {
        mIntermediateMat = new Mat();
    }

    public void onCameraViewStopped() {
        // Explicitly deallocate Mats
        if (mIntermediateMat != null)
            mIntermediateMat.release();

        mIntermediateMat = null;
    }

    public Mat onCameraFrame(CvCameraViewFrame inputFrame) {
        Mat rgba = inputFrame.rgba();
        Size sizeRgba = rgba.size();

        Mat rgbaInnerWindow;

        int rows = (int) sizeRgba.height;
        int cols = (int) sizeRgba.width;

        int left = cols / 8;
        int top = rows / 8;

        int width = cols * 3 / 4;
        int height = rows * 3 / 4;

        switch (MainActivity._viewMode) {
            case MainActivity.VIEW_MODE_RGBA:
                break;

            case MainActivity.TRAIN:
                _viewMode = SHOW_MATCHES;
                return trainFeatureDetector(inputFrame);
            case MainActivity.SHOW_MATCHES:
            case MainActivity.SHOW_BOX:
            case MainActivity.SHOW_KEYPOINTS:
                try {
                    Mat gray2 = inputFrame.gray();
                    List<DMatch> good_matches = findMatches(inputFrame);
                    if (good_matches == null) return gray2;
                    if (MainActivity._viewMode == MainActivity.SHOW_BOX)
                        return drawBox(gray2, _keypoints2, good_matches);
                    if (MainActivity._viewMode == MainActivity.SHOW_MATCHES)
                        return drawMatches(gray2, _keypoints2, good_matches, (double) gray2.height(), (double) gray2.width());
                    else {
                        Mat outputImage = new Mat();
                        Features2d.drawKeypoints(gray2, _keypoints2, outputImage);
                        takeScreenShot(outputImage);
                        return outputImage;
                    }
                }
                catch (Exception e) {
                    _numMatches = "";
                    _minDistance = -1;
//                    Log.e(TAG, e.getMessage());
                    return rgba;
                }
        }

        return rgba;
    }
    private void takeScreenShot(Mat image) {
        if (_takePicture) {
            _takePicture = false;
            Utilities.saveImg(image);
            showToast("Screen Shot saved to device.");
        }
    }
    private List<DMatch> findMatches(CvCameraViewFrame inputFrame) {
//        Log.i(TAG, "Start match");
        Mat gray2 = inputFrame.gray();
        _descriptors2 = new Mat();
        _keypoints2 = new MatOfKeyPoint();
        if (_detector == null) {
            showToast("Detector is null. You must re-train.");
            return null;
        }

        _detector.detect(gray2, _keypoints2);
        descriptorExtractor.compute(gray2, _keypoints2, _descriptors2);

        MenuItem knnCheckBox = _menu.findItem(R.id.KNN);
        MenuItem crossCheckCheckBox = _menu.findItem(R.id.CrossCheck);
        List<DMatch> matches12_list;
        boolean runRatioTest = _menu.findItem(R.id.Ratio).isChecked();
        int nNearestNeighbors = runRatioTest ? 2 : 15;
        if (knnCheckBox.isChecked()) {
            List<MatOfDMatch> knnmatches12 = new ArrayList<>();
            _matcher.knnMatch(_descriptors, _descriptors2, knnmatches12, nNearestNeighbors);
            matches12_list = new ArrayList<>();
            if (runRatioTest) {
                for (MatOfDMatch mat : knnmatches12) {
                    List<DMatch> tempList = mat.toList();
                    if (tempList.get(0).distance < .75 * tempList.get(1).distance)
                        matches12_list.add(tempList.get(0));
                }
            }
            else {
                for (MatOfDMatch mat : knnmatches12) {
                    matches12_list.addAll(mat.toList());
                }
            }
        }
        else {
            MatOfDMatch matches12 = new MatOfDMatch();
            _matcher.match(_descriptors, _descriptors2, matches12);
            matches12_list = matches12.toList();
        }

        List<DMatch> filtered_list;
        if (crossCheckCheckBox.isChecked()) {
            // Cross-check. (see http://answers.opencv.org/question/15/how-to-get-good-matches-from-the-orb-feature-detection-algorithm/)
            filtered_list = new ArrayList<>();
            List<DMatch> matches21_list;
            if (knnCheckBox.isChecked()) {
                List<MatOfDMatch> knnmatches21 = new ArrayList<>();
                _matcher.knnMatch(_descriptors2, _descriptors, knnmatches21, nNearestNeighbors);
                matches21_list = new ArrayList<>();
//                for (MatOfDMatch mat : knnmatches21) {
//                    matches21_list.addAll(mat.toList());
//                }
                if (runRatioTest) {
                    for (MatOfDMatch mat : knnmatches21) {
                        List<DMatch> tempList = mat.toList();
                        if (tempList.get(0).distance < .75 * tempList.get(1).distance)
                            matches21_list.add(tempList.get(0));
                    }
                }
                else {
                    for (MatOfDMatch mat : knnmatches21) {
                        matches21_list.addAll(mat.toList());
                    }
                }
            }
            else {
                MatOfDMatch matches21 = new MatOfDMatch();
                _matcher.match( _descriptors2, _descriptors, matches21 );
                matches21_list = matches21.toList();
            }
            for(int i = 0; i < matches12_list.size(); i++ )
            {
                DMatch forward = matches12_list.get(i);
                if (forward.trainIdx > matches21_list.size() - 1) continue;
                DMatch backward = matches21_list.get(forward.trainIdx);
                if( backward.trainIdx == forward.queryIdx )
                    filtered_list.add( forward );
            }
        }
        else {
            filtered_list = matches12_list;
        }

        double max_dist = 0;
        double min_dist = 100;


        //-- Quick calculation of max and min distances between keypoints
        for (int i = 0; i < filtered_list.size(); i++) {
            double dist = filtered_list.get(i).distance;
            if (dist < min_dist)
                min_dist = dist;
            if (dist > max_dist)
                max_dist = dist;
        }

        //-- Draw only "good" matches (i.e. whose distance is less than 3*min_dist )
        List<DMatch> good_matches_list = new ArrayList<>();
        for (int i = 0; i < filtered_list.size(); i++) {
            if (filtered_list.get(i).distance < _maxMin) {
                good_matches_list.add(filtered_list.get(i));
            }
        }

//        Log.i(TAG, "Found this many matches: " + good_matches_list.size());
        _numMatches = String.format("%d/%d/%d", matches12_list.size(), filtered_list.size(), good_matches_list.size());
        _minDistance = (int) min_dist;
        updateTextViews();

        return good_matches_list;
    }
    private Mat drawMatches(Mat gray2, MatOfKeyPoint _keypoints2, List<DMatch> matches_list, double rows, double cols) {
        Mat outputImg = new Mat();

        MatOfDMatch  good_matches = new MatOfDMatch();
        for (DMatch match : matches_list) {
            MatOfDMatch temp = new MatOfDMatch();
            temp.fromArray(match);
            good_matches.push_back(temp);
        }

        Features2d.drawMatches(_img1, _keypoints, gray2, _keypoints2, good_matches, outputImg);
//        Log.i(TAG, "Saving");
//        saveImg(outputImg);
//        Log.i(TAG, "Saved");
        Mat resizedImg = new Mat();
        Imgproc.resize(outputImg, resizedImg, new Size(cols, rows));
//        Imgproc.resize(outputImg, resizedImg, new Size(), cols/outputImg.width(), rows/outputImg.height(), Imgproc.INTER_NEAREST);
        takeScreenShot(resizedImg);

        return resizedImg;
    }
    private Mat drawBox(Mat gray2, MatOfKeyPoint _keypoints2, List<DMatch> good_matches_list) {
        LinkedList<Point> objList = new LinkedList<>();
        LinkedList<Point> sceneList = new LinkedList<>();
        List<KeyPoint> _keypoints2_List = _keypoints2.toList();
        List<KeyPoint> keypoints_List = _keypoints.toList();

        for (int i = 0; i < good_matches_list.size(); i++) {
            objList.addLast(keypoints_List.get(good_matches_list.get(i).queryIdx).pt);
            sceneList.addLast(_keypoints2_List.get(good_matches_list.get(i).trainIdx).pt);
        }

        MatOfPoint2f obj = new MatOfPoint2f();
        obj.fromList(objList);

        MatOfPoint2f scene = new MatOfPoint2f();
        scene.fromList(sceneList);

        Mat hg = Calib3d.findHomography(obj, scene, Calib3d.RANSAC, _ransacThreshold);

        Mat obj_corners = new Mat(4, 1, CvType.CV_32FC2);
        Mat scene_corners = new Mat(4, 1, CvType.CV_32FC2);

        obj_corners.put(0, 0, new double[]{0, 0});
        obj_corners.put(1, 0, new double[]{_img1.cols(), 0});
        obj_corners.put(2, 0, new double[]{_img1.cols(), _img1.rows()});
        obj_corners.put(3, 0, new double[]{0, _img1.rows()});
        //obj_corners:input

        Mat outputImage = new Mat();
        Features2d.drawKeypoints(gray2, _keypoints2, outputImage);

        Core.perspectiveTransform(obj_corners, scene_corners, hg);
        int adj = 0;
        Imgproc.line(outputImage, adjustPoint(adj, scene_corners.get(0, 0)), adjustPoint(adj, scene_corners.get(1, 0)), new Scalar(0, 255, 0), 4);
        Imgproc.line(outputImage, adjustPoint(adj, scene_corners.get(1, 0)), adjustPoint(adj, scene_corners.get(2, 0)), new Scalar(0, 255, 0), 4);
        Imgproc.line(outputImage, adjustPoint(adj, scene_corners.get(2, 0)), adjustPoint(adj, scene_corners.get(3, 0)), new Scalar(0, 255, 0), 4);
        Imgproc.line(outputImage, adjustPoint(adj, scene_corners.get(3, 0)), adjustPoint(adj, scene_corners.get(0, 0)), new Scalar(0, 255, 0), 4);

//        Log.i(TAG, "Done matching");
        takeScreenShot(outputImage);
        return outputImage;
    }
    private Mat trainFeatureDetector(CvCameraViewFrame inputFrame) {
        Mat gray1 = inputFrame.gray();

        _descriptors = new Mat();
        _keypoints = new MatOfKeyPoint();
        _detector = FeatureDetector.create(_featureDetectorID);

        File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "FeatureDetectorApp");

        descriptorExtractor = DescriptorExtractor.create(_descriptorExtractorID);

        if (_featureDetectorID == DescriptorExtractor.SIFT || _featureDetectorID == DescriptorExtractor.SURF)
            _matcher = DescriptorMatcher.create(DescriptorMatcher.BRUTEFORCE_SL2);
        else {
            _matcher = DescriptorMatcher.create(DescriptorMatcher.BRUTEFORCE_HAMMINGLUT);
//            _matcher = DescriptorMatcher.create(DescriptorMatcher.FLANNBASED);            // too slow
        }

        _detector.detect(gray1, _keypoints, _descriptors);
        descriptorExtractor.compute(gray1, _keypoints, _descriptors);

        _img1 = gray1.clone();

        Mat outputImage = new Mat();
        Features2d.drawKeypoints(gray1, _keypoints, outputImage);
//        Log.i(TAG, "Found keypoints: " + _keypoints.toList().size());
        Utilities.saveImg(outputImage);
        showToast("Trained " +  _modelMenu.getTitle());
        return outputImage;
    }
    private Point adjustPoint(int adj, double[] pt) {
        pt[0] += adj;
        return new Point(pt);
    }
    private void updateTextViews() {
        MainActivity.this.runOnUiThread(new Runnable() {

            @Override
            public void run() {
                _numMatchesTextView.setText(String.valueOf(_numMatches));
                _minDistanceTextView.setText(String.valueOf(_minDistance));
                _ransacThresholdTextView.setText(String.valueOf(_ransacThreshold));
                _maxMinTextView.setText(String.valueOf(_maxMin));
            }
        });
    }
    //method for when the progress bar is changed
    public void onProgressChanged(SeekBar seekBar, int progress,
                                  boolean fromUser) {
        if (seekBar.getId() == R.id.maxMinSeekBar)
            _maxMin = progress;
        else
            _ransacThreshold = progress;
    }
    //method for when the progress bar is first touched
    public void onStartTrackingTouch(SeekBar seekBar) {
    }
    //method for when the progress bar is released
    public void onStopTrackingTouch(SeekBar seekBar) {
    }
    private void showToast(String msg) {
        _toastMsg = msg;
        MainActivity.this.runOnUiThread(new Runnable() {

            @Override
            public void run() {
                Toast.makeText(MainActivity.this, _toastMsg, Toast.LENGTH_SHORT).show();

            }
        });
    }
    public boolean onPrepareOptionsMenu(Menu menu) {
//        _modeMenuItem = menu.findItem(R.id.action_settings);
        _menu = menu;
        _modelMenu = menu.findItem(R.id.model_selection);
        MenuItem item = menu.findItem(R.id.ORB);
        item.setChecked(true);
        return super.onPrepareOptionsMenu(menu);
    }
    private void setModel(int id) {
        if (id == R.id.ORB) {
            _featureDetectorID = FeatureDetector.ORB;
            _descriptorExtractorID = DescriptorExtractor.ORB;
            _modelMenu.setTitle("Model: ORB");
            _detector = null;   // force user to retrain.
            _viewMode = VIEW_MODE_RGBA;
            showToast("Model updated, please press 'Train'.");
        }
        if (id == R.id.BRISK) {
            _featureDetectorID = FeatureDetector.BRISK;
            _descriptorExtractorID = DescriptorExtractor.BRISK;
            _modelMenu.setTitle("Model: BRISK");
            _detector = null;   // force user to retrain.
            _viewMode = VIEW_MODE_RGBA;
            showToast("Model updated, please press 'Train'.");
        }
        if (id == R.id.ORBFREAK) {
            _featureDetectorID = FeatureDetector.ORB;
            _descriptorExtractorID = DescriptorExtractor.FREAK;
            _modelMenu.setTitle("Model: ORB/FREAK");
            _detector = null;   // force user to retrain.
            _viewMode = VIEW_MODE_RGBA;
            showToast("Model updated, please press 'Train'.");
        }
//        if (id == R.id.SIFT) {
//            _featureDetectorID = FeatureDetector.SIFT;
//            _descriptorExtractorID = DescriptorExtractor.SIFT;
//            _modelMenu.setTitle("Model: SIFT");
//            _detector = null;   // force user to retrain.
//            _viewMode = VIEW_MODE_RGBA;
//            showToast("Model updated, please press 'Train'.");
//        }
//        if (id == R.id.SURF) {
//            _featureDetectorID = FeatureDetector.SURF;
//            _descriptorExtractorID = DescriptorExtractor.SURF;
//            _modelMenu.setTitle("Model: SURF");
//            _detector = null;   // force user to retrain.
//            _viewMode = VIEW_MODE_RGBA;
//            showToast("Model updated, please press 'Train'.");
//        }
        if (id == R.id.STAR) {
            _featureDetectorID = FeatureDetector.STAR;
            _descriptorExtractorID = DescriptorExtractor.BRIEF;
            _modelMenu.setTitle("Model: STAR/BRIEF");
            _detector = null;   // force user to retrain.
            _viewMode = VIEW_MODE_RGBA;
            showToast("Model updated, please press 'Train'.");
        }
//        if (id == R.id.SURFBRIEF) {
//            _featureDetectorID = FeatureDetector.SURF;
//            _descriptorExtractorID = DescriptorExtractor.BRIEF;
//            _modelMenu.setTitle("Model: SURF/BRIEF");
//            _detector = null;   // force user to retrain.
//            _viewMode = VIEW_MODE_RGBA;
//            showToast("Model updated, please press 'Train'.");
//        }
    }
}
