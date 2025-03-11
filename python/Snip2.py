import sys
import os
from PyQt5.QtWidgets import QApplication, QMainWindow, QRubberBand
from PyQt5.QtCore import QRect, Qt
from PyQt5.QtGui import QPixmap, QScreen

class SnippingTool(QMainWindow):
    def __init__(self, save_path):
        super().__init__()
        self.save_path = save_path
        self.rubberBand = QRubberBand(QRubberBand.Rectangle, self)
        self.origin = None
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint)
        self.showFullScreen()

    def mousePressEvent(self, event):
        self.origin = event.pos()
        self.rubberBand.setGeometry(QRect(self.origin, event.pos()))
        self.rubberBand.show()

    def mouseMoveEvent(self, event):
        if self.origin:
            self.rubberBand.setGeometry(QRect(self.origin, event.pos()).normalized())

    def mouseReleaseEvent(self, event):
        screen = QApplication.primaryScreen()
        screenshot = screen.grabWindow(0, self.rubberBand.geometry().x(), self.rubberBand.geometry().y(),
                                       self.rubberBand.width(), self.rubberBand.height())
        screenshot.save(self.save_path, "png")
        self.close()
        QApplication.quit()  # Ensure app quits after snipping

if __name__ == "__main__":
    app = QApplication(sys.argv)
    save_path = sys.argv[1] if len(sys.argv) > 1 else "snip.png"  # Default name
    window = SnippingTool(save_path)
    app.exec_()
